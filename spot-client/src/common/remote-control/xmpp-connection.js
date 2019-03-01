import { $iq } from 'strophe.js';

import { logger } from 'common/logger';
import { JitsiMeetJSProvider } from 'common/vendor';

import { IQ_NAMESPACES, IQ_TIMEOUT } from './constants';

/**
 * Represents an XMPP connection to a prosody service.
 */
export default class XmppConnection {
    /**
     * Initializes a new {@code XmppConnection} instance.
     *
     * @param {Object} options - Attributes to initialize the instance with.
     * @param {Object} options.configuration - Details of endpoints to use for
     * creating the XMPP connection.
     * @param {string} options.configuration.bosh - The bosh url to use for
     * long-polling witht the XMPP service.
     * @param {Object} options.configuration.hosts - Details of endpoints to use
     * for where to reate the MUC.
     * @param {string} options.configuration.hosts.domain - The overall domain
     * for which sub routes will be defined.
     * @param {string} options.configuration.hosts.muc - Specifically the url
     * where MUCs should be created.
     * @param {Function} options.onRemoteCommand - Callback to invoke when a
     * private message is received.
     * @param {Function} options.onSpotStatusUpdate - Callback to invoke when
     * a Spot has updated its status.
     */
    constructor(options) {
        this.options = options;

        this.initPromise = null;

        this._onCommand = this._onCommand.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onPresence = this._onPresence.bind(this);
    }

    /**
     * Establishes the XMPP connection with a jitsi deployment.
     *
     * @param {Object} options - Information necessary for creating the MUC.
     * @param {boolean} options.joinAsSpot - Whether or not this connection is
     * being made by a Spot client.
     * @param {string} options.lock - The lock code to use when joining or
     * to set when creating a new MUC.
     * @param {Function} options.onDisconnect - Callback to invoke when the
     * connection has been terminated without an explicit disconnect.
     * @param {string} options.roomName - The name of the MUC to join or create.
     * @returns {Promise<string>} - The promise resolves with the connection's
     * jid.
     */
    joinMuc({ joinAsSpot, lock, onDisconnect, roomName }) {
        if (this.initPromise) {
            return this.initPromise;
        }

        const JitsiMeetJS = JitsiMeetJSProvider.get();

        this.xmppConnection = new JitsiMeetJS.JitsiConnection(
            null,
            null,
            {
                bosh:
                    `${this.options.configuration.bosh}?room=${roomName}`,
                hosts: this.options.configuration.hosts
            }
        );

        const connectionPromise = new Promise((resolve, reject) => {
            this.xmppConnection.addEventListener(
                JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                () => {
                    this.xmppConnection.addEventListener(
                        JitsiMeetJS.events.connection.CONNECTION_FAILED,
                        onDisconnect);

                    resolve();
                }
            );

            this.xmppConnection.addEventListener(
                JitsiMeetJS.events.connection.CONNECTION_FAILED,
                reject
            );
        });

        this.xmppConnection.xmpp.connection.addHandler(
            this._onPresence,
            null,
            'presence',
            'unavailable',
            null
        );

        this.xmppConnection.xmpp.connection.addHandler(
            this._onCommand,
            IQ_NAMESPACES.COMMAND,
            'iq',
            'set',
            null,
            null
        );

        this.xmppConnection.xmpp.connection.addHandler(
            this._onMessage,
            IQ_NAMESPACES.MESSAGE,
            'iq',
            'set',
            null,
            null
        );

        const joinPromise = new Promise((resolve, reject) => {
            this.xmppConnection.xmpp.connection.addHandler(
                () => {
                    reject();

                    return true;
                },
                null,
                'presence',
                'error',
                null
            );

            // This is a generic presence handler that gets all presence,
            // including error and unavailable.
            this.xmppConnection.xmpp.connection.addHandler(
                presence => {
                    const errors = presence.getElementsByTagName('error');

                    if (errors.length) {
                        const error = errors[0].children[0].tagName;

                        reject(error);

                        return true;
                    }

                    resolve();

                    return this._onPresence(presence);
                },
                null,
                'presence',
                null, // null to get passed all presence types into callback
                null
            );
        });

        this.xmppConnection.connect();

        let mucJoinedPromise;

        this.initPromise = connectionPromise
            .then(() => this._createMuc(roomName))
            .then(room => {
                mucJoinedPromise = new Promise(resolve => {
                    room.addEventListener('xmpp.muc_joined', resolve);
                });
            })
            .then(() => {
                if (joinAsSpot) {
                    this.updatePresence('isSpot', true);
                }
            })
            .then(() => this._joinMuc(lock))
            .then(() => Promise.all([ joinPromise, mucJoinedPromise ]));

        return this.initPromise;
    }

    /**
     * Disconnects from any joined MUC and disconnects the XMPP connection.
     *
     * @returns {Promise}
     */
    destroy() {
        const leavePromise = this.room ? this.room.leave() : Promise.resolve();

        // FIXME: The leave promise always times out.
        return leavePromise
            .catch(error =>
                logger.error(`XmppConnection error on disconnect ${error}`))
            .then(() => this.xmppConnection.disconnect());
    }

    /**
     * Creates a MUC for the Spot and remote controllers to join to communicate
     * with each other.
     *
     * @param {string} roomName - The name of the muc to create.
     * @returns {Object} The instance of the created muc.
     */
    _createMuc(roomName) {
        if (this.room) {
            return this.room;
        }

        this.room = this.xmppConnection.xmpp.createRoom(roomName, { disableFocus: true });

        return this.room;
    }

    /**
     * Signals to the muc that the participant is joining the muc. This allows
     * for receipt of messages from other participants in the muc.
     *
     * @param {string} lock - A lock code, if any, to set in order to join the
     * muc.
     * @returns {Promise} - A Promise resolved when libjitsi-meet's ChatRoom.join method is resolved
     * which is not exactly equal with being in the muc already.
     */
    _joinMuc(lock) {
        // NOTE At the time of this writing lib-jitsi-meet resolves this promise without
        // waiting for the actually confirmation that the muc room has been joined.
        //
        // The 'lock' argument is optional on the lib-jitsi-meet side and it's fine to pass
        // undefined.
        return this.room.join(lock);
    }

    /**
     * Sets the presence status for a given type.
     *
     * @param {string} type - The present attribute to change.
     * @param {string} value - The new value to associate with the presence
     * attribute.
     * @returns {void}
     */
    updatePresence(type, value) {
        this.room.addToPresence(type, { value });
    }

    /**
     * Updates the current muc participant's status, which should notify other
     * participants of the update. This is a fire and forget call with no ack.
     *
     * @param {string} type - The status type to send.
     * @param {*} value - Additional information about the status update.
     * @returns {void}
     */
    updateStatus(type, value) {
        let valueToSend = value;

        if (typeof value !== 'string') {
            valueToSend = JSON.stringify(value);
        }

        this.updatePresence(type, valueToSend);
        this.room.sendPresence();
    }

    /**
     * Send a direct message to another participant in the muc.
     *
     * @param {string} to - The JID to send the command to.
     * @param {string} command - The command type to send.
     * @param {Object} data - Additional information about how to execute the
     * command.
     * @returns {Promise}
     */
    sendCommand(to, command, data = {}) {
        const iq = $iq({
            to,
            type: 'set'
        })
        .c('command', {
            xmlns: IQ_NAMESPACES.COMMAND,
            type: command
        })
        .t(JSON.stringify(data))
        .up();

        return new Promise((resolve, reject) => {
            this.room.connection.sendIQ(
                iq,
                responseIq => {
                    const response = responseIq.getElementsByTagName('data')[0];

                    resolve(response ? JSON.parse(response.textContent) : {});
                },
                reject,
                IQ_TIMEOUT
            );
        });
    }

    /**
     * Send a message iq to another participant in the muc. A message expects
     * no immediate action taken in response.
     *
     * @param {string} to - The jid to send the message to.
     * @param {string} type - The message type to send.
     * @param {Object} data - Additional details to send.
     * @returns {Promise}
     */
    sendMessage(to, type, data) {
        const iq = $iq({
            to,
            type: 'set'
        })
        .c('message', {
            type,
            xmlns: IQ_NAMESPACES.MESSAGE
        })
        .t(JSON.stringify(data))
        .up();

        return new Promise((resolve, reject) => {
            this.room.connection.sendIQ(
                iq,
                resolve,
                reject,
                IQ_TIMEOUT
            );
        });
    }

    /**
     * Callback invoked to process and acknowledge and incoming IQ.
     *
     * @param {Object} iq - The iq containing the response from a command.
     * @private
     * @returns {boolean}
     */
    _onCommand(iq) {
        const ack = this.options.onRemoteCommand(iq);

        this.room.connection.send(ack);

        return true;
    }

    /**
     * Callback invoked to process and acknowledge and incoming iq.
     *
     * @param {Object} iq - The iq containing a message.
     * @private
     * @returns {boolean}
     */
    _onMessage(iq) {
        const ack = this.options.onRemoteMessage(iq);

        this.room.connection.send(ack);

        return true;
    }

    /**
     * The identifier for the the muc. Returns the full jid, which has
     * user@domain.
     *
     * @returns {string}
     */
    getRoomBareJid() {
        return this.room.roomjid.split('/')[0];
    }

    /**
     * The identifier for the local user in the MUC. Returns the full jid, which
     * has user@domain/resource.
     *
     * @returns {string}
     */
    getRoomFullJid() {
        return this.room && this.room.myroomjid;
    }

    /**
     * Returns the current known lock on the muc.
     *
     * @returns {string}
     */
    getLock() {
        return this._lock;
    }

    /**
     * Sets a new lock code on the current MUC.
     *
     * @param {string} lock - The new code code to place on the MUC.
     * @returns {Promise}
     */
    setLock(lock) {
        this._lock = lock;

        return new Promise((resolve, reject) => {
            this.room.lockRoom(this._lock, resolve, reject, reject);
        });
    }

    /**
     * Callback invoked when the status of another participant in the muc has
     * changed.
     *
     * @param {XML} presence - Details of the current presence.
     * @private
     * @returns {boolean}
     */
    _onPresence(presence) {
        this.options.onSpotStatusUpdate(presence);

        return true;
    }
}
