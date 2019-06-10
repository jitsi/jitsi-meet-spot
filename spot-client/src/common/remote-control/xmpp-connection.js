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
     * @param {Function} options.onCommandReceived - Callback to invoke when an
     * iq command is received.
     * @param {Function} options.onMessageReceived - Callback invoked  when an
     * iq message is received.
     * @param {Function} options.onPresenceReceived - Callback to invoke when
     * receiving a new presence.
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
     * @param {string} options.jwt - The JWT token to be used with the XMPP
     * connection.
     * @param {boolean} [options.retryOnUnauthorized] - Whether or not to retry
     * connection without a roomLock if an unauthorized error occurs.
     * @param {string} [options.roomLock] - The lock code to use when joining or
     * to set when creating a new MUC.
     * @param {Function} options.onDisconnect - Callback to invoke when the
     * connection has been terminated without an explicit disconnect.
     * @param {string} options.roomName - The name of the MUC to join or create.
     * @returns {Promise<string>} - The promise resolves with the connection's
     * jid.
     */
    joinMuc(options) {
        const {
            joinAsSpot,
            jwt,
            retryOnUnauthorized,
            roomLock,
            roomName,
            onDisconnect
        } = options;

        if (this.initPromise) {
            return this.initPromise;
        }

        const JitsiMeetJS = JitsiMeetJSProvider.get();

        this.xmppConnection = new JitsiMeetJS.JitsiConnection(
            null,
            jwt,
            {
                p2p: {
                    useStunTurn: true
                },
                ...this.options.configuration,
                bosh:
                    `${this.options.configuration.bosh}?room=${roomName}`
            }
        );

        const connectionEvents = JitsiMeetJS.events.connection;

        const connectionPromise = new Promise((resolve, reject) => {
            this.xmppConnection.addEventListener(
                connectionEvents.CONNECTION_ESTABLISHED,
                () => {
                    this.xmppConnection.addEventListener(
                        connectionEvents.CONNECTION_FAILED,
                        onDisconnect);

                    resolve();
                }
            );

            this.xmppConnection.addEventListener(
                connectionEvents.CONNECTION_FAILED,
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


        const createJoinPromise = function () {
            return new Promise((resolve, reject) => {
                const { connection } = this.xmppConnection.xmpp;

                const onSuccessConnect = presence => {
                    const errors = presence.getElementsByTagName('error');

                    if (errors.length) {
                        const error = errors[0].children[0].tagName;

                        reject(error);

                        return true;
                    }

                    resolve();

                    return this._onPresence(presence);
                };

                const onFailedConnect = reason => {
                    connection.deleteHandler(onFailedConnect);
                    connection.deleteHandler(onSuccessConnect);

                    reject(reason);

                    return true;
                };

                connection.addHandler(
                    onFailedConnect,
                    null,
                    'presence',
                    'error',
                    null
                );

                // This is a generic presence handler that gets all presence,
                // including error and unavailable.
                connection.addHandler(
                    onSuccessConnect,
                    null,
                    'presence',
                    null, // null to get passed all presence types into callback
                    null
                );
            });
        }.bind(this);

        const joinPromise = createJoinPromise();

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
            .then(() => this._joinMuc(roomLock))
            .then(() => joinPromise
                .catch(reason => {
                    logger.error('xmpp-connection connect failed', { reason });

                    if (retryOnUnauthorized
                        && Boolean(roomLock)
                        && reason === 'not-authorized') {
                        logger.log(
                            'xmpp-connection retrying on not-authorized error');

                        const newJoinPromise = createJoinPromise();

                        this._joinMuc();

                        return newJoinPromise;
                    }

                    return Promise.reject(reason);
                })
            )
            .then(() => mucJoinedPromise);

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
                logger.error('XmppConnection error on disconnect', { error }))
            .then(() => this.xmppConnection && this.xmppConnection.disconnect());
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
     * @param {string} roomLock - A lock code, if any, to set in order to join the
     * muc.
     * @returns {Promise} - A Promise resolved when libjitsi-meet's ChatRoom.join method is resolved
     * which is not exactly equal with being in the muc already.
     */
    _joinMuc(roomLock) {
        // NOTE At the time of this writing lib-jitsi-meet resolves this promise without
        // waiting for the actually confirmation that the muc room has been joined.
        //
        // The 'roomLock' argument is optional on the lib-jitsi-meet side and it's fine to pass
        // undefined.
        return this.room.join(roomLock);
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
        this.room && this.room.addToPresence(type, { value });
    }

    /**
     * Updates the current muc participant's status, which should notify other
     * participants of the update. This is a fire and forget call with no ack.
     *
     * @param {Object} newStatus - The presence values to be updated. The
     * key-values will override existing presence key-values and will not
     * override the complete presence.
     * @returns {void}
     */
    updateStatus(newStatus = {}) {
        Object.keys(newStatus).forEach(key => {
            let valueToSend = newStatus[key];

            if (typeof valueToSend !== 'string') {
                valueToSend = JSON.stringify(valueToSend);
            }

            this.updatePresence(key, valueToSend);
        });

        this._sendPresence();
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
        let ack;

        if (this.options.onCommandReceived) {
            ack = this.options.onCommandReceived(iq);
        } else {
            // FIXME: Correctly send back that command handling has not been
            // initialized.
            const from = iq.getAttribute('from');

            ack = $iq({
                id: iq.getAttribute('id'),
                type: 'result',
                to: from
            });
        }

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
        const ack = this.options.onMessageReceived(iq);

        this.room.connection.send(ack);

        return true;
    }

    /**
     * Returns the underlying {@link JitsiConnection} instance.
     *
     * @returns {JitsiMeetJS.JitsiConnection}
     */
    getJitsiConnection() {
        return this.xmppConnection;
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
     * Returns the current known lock on the MUC.
     *
     * @returns {string}
     */
    getLock() {
        return this._roomLock;
    }

    /**
     * Sets a new lock code on the current MUC.
     *
     * @param {string} roomLock - The new code code to place on the MUC.
     * @returns {Promise}
     */
    setLock(roomLock) {
        this._roomLock = roomLock;

        return new Promise((resolve, reject) => {
            this.room.lockRoom(this._roomLock, resolve, reject, reject);
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
        this.options.onPresenceReceived(presence);

        return true;
    }

    /**
     * Updates other participant's in the MUC about the local client's status.
     *
     * @private
     * @returns {void}
     */
    _sendPresence() {
        this.room && this.room.sendPresence();
    }
}
