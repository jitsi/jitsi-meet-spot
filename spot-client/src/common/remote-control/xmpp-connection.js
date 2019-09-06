import { $iq } from 'strophe.js';

import { logger } from 'common/logger';
import { JitsiMeetJSProvider } from 'common/vendor';

import { IQ_NAMESPACES, IQ_TIMEOUT } from './constants';

/**
 * XML element name for spot status added to MUC presence.
 * @type {string}
 */
const SPOT_STATUS_ELEMENT_NAME = 'spot-status';

/**
 * XML namespace for Spot specific XML.
 * @type {string}
 */
const SPOT_XMLNS = 'https://jitsi.org/spot';

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

        this._hasJoinedMuc = false;
        this._participants = new Set();

        /**
         * A reference to all rejection functions for IQ requests in flight.
         */
        this._pendingIQRequestRejections = new Set();

        this._onCommand = this._onCommand.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onPresence = this._onPresence.bind(this);

        this._spotStatus = { };
    }

    /**
     * Establishes the XMPP connection with a jitsi deployment.
     *
     * @param {Object} options - Information necessary for creating the MUC.
     * @param {boolean} options.joinAsSpot - Whether or not this connection is
     * being made by a Spot client.
     * @param {string} options.jwt - The JWT token to be used with the XMPP
     * connection.
     * @param {string} [options.resourceName] - The resource part of the MUC JID to be used(optional).
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
            resourceName,
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
            null,
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

                /**
                 * Callback invoked on the initial presence received from the MUC
                 * to determine a successful join.
                 *
                 * @param {Object} presence - The initial XML presence update.
                 * @returns {boolean} False to unregister the handler from strophe.
                 */
                const onSuccessConnect = presence => {
                    const errors = presence.getElementsByTagName('error');

                    if (errors.length) {
                        const error = errors[0].children[0].tagName;

                        reject(error);

                        return false;
                    }

                    this._hasJoinedMuc = true;

                    resolve();

                    return false;
                };

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
            .then(() => this._createMuc(roomName, resourceName))
            .then(room => {
                mucJoinedPromise = new Promise(resolve => {
                    room.addEventListener('xmpp.muc_joined', resolve);
                });
            })
            .then(() => {
                if (joinAsSpot) {
                    this.updateStatus({ isSpot: true });
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
     * @param {Object} [event] - Optionally, the event which triggered the
     * necessity to disconnect from the XMPP server.
     * @returns {Promise}
     */
    destroy(event) {
        const leavePromise = this.xmppConnection
            ? this.xmppConnection.disconnect(event)
            : Promise.resolve();

        return leavePromise
            .catch(error =>
                logger.error('XmppConnection error on disconnect', { error }))
            .then(() => {
                this._participants.clear();
                this._pendingIQRequestRejections.forEach(reject => reject());
                this._pendingIQRequestRejections.clear();
            });
    }

    /**
     * Creates a MUC for the Spot and remote controllers to join to communicate
     * with each other.
     *
     * @param {string} roomName - The name of the muc to create.
     * @param {string} [resourceName] - An additional identifier to attach to
     * the MUC participant.
     * @returns {Object} The instance of the created muc.
     */
    _createMuc(roomName, resourceName) {
        if (this.room) {
            return this.room;
        }

        this.room = this.xmppConnection.xmpp.createRoom(
            roomName,
            {
                disableFocus: true
            },
            resourceName ? () => resourceName : undefined
        );

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
     * Updates the current muc participant's status, which should notify other
     * participants of the update. This is a fire and forget call with no ack.
     *
     * @param {Object} newStatus - The presence values to be updated. The
     * key-values will override existing presence key-values and will not
     * override the complete presence.
     * @returns {void}
     */
    updateStatus(newStatus = {}) {
        this._spotStatus = {
            ...this._spotStatus,
            ...newStatus
        };

        this.room
            && this.room.addToPresence(
                SPOT_STATUS_ELEMENT_NAME, {
                    value: JSON.stringify(this._spotStatus),
                    attributes: {
                        xmlns: SPOT_XMLNS
                    }
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

        return this._sendIQ(iq)
            .then(responseIq => {
                const response = responseIq.getElementsByTagName('data')[0];

                return response ? JSON.parse(response.textContent) : {};
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

        return this._sendIQ(iq);
    }

    /**
     * Callback invoked to process and acknowledge and incoming IQ.
     *
     * @param {Object} iq - The iq containing the response from a command.
     * @private
     * @returns {boolean}
     */
    _onCommand(iq) {
        const command = XmppConnection.convertXMLCommandToObject(iq);

        // FIXME: Correctly send back that command handling has not been initialized.
        if (this.options.onCommandReceived) {
            this.options.onCommandReceived(command);
        }

        const ack = $iq({
            id: command.id,
            type: 'result',
            to: command.from
        });

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
        const parsedIq = XmppConnection.convertXMLMessageToObject(iq);

        this.options.onMessageReceived(parsedIq);

        const ack = $iq({
            id: parsedIq.id,
            to: parsedIq.from,
            type: 'result'
        });

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
        const parsedPresence = this.convertXMLPresenceToObject(presence);

        // Suppress any presence errors until the MUC is joined as those
        // initial presence errors are handled by the join flow instead.
        if (!parsedPresence || (parsedPresence.type === 'error' && !this._hasJoinedMuc)) {
            return true;
        }

        // Update internal knowledge of participants
        if (parsedPresence.type === 'join') {
            this._participants.add(parsedPresence.from);
        } else if (parsedPresence.type === 'unavailable') {
            this._participants.delete(parsedPresence.from);
        }

        this.options.onPresenceReceived(parsedPresence);

        return true;
    }

    /**
     * Helper to encapsulate wrapping the IQ send in a promise. Stores a
     * reference to the IQ request in case pending requests need to be cleared,
     * which can happen when strophe disconnects but does not reject requests
     * in flight.
     *
     * @param {Object} iq - The IQ to send.
     * @private
     * @returns {Promise}
     */
    _sendIQ(iq) {
        return new Promise((resolve, reject) => {
            this._pendingIQRequestRejections.add(reject);

            this.room.connection.sendIQ(
                iq,
                (...args) => {
                    this._pendingIQRequestRejections.delete(reject);
                    resolve(...args);
                },
                (...args) => {
                    this._pendingIQRequestRejections.delete(reject);
                    reject(...args);
                },
                IQ_TIMEOUT
            );
        });
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

    /**
     * @typedef {Object} Command - An request sent from one user to another to
     * perform an action.
     *
     * @property {string} commandType - The category of the command. Should be
     * one of the enumerated constants in {@code COMMANDS}.
     * @property {Object} data - Details about how to perform the command.
     * @property {string} from - The jid of the user sending the command.
     * @property {string} id - The command id attached to the iq by prosody.
     */

    /**
     * Converts a command embedded into an IQ into a plain JS object.
     *
     * @param {XML} commandIq - The command to convert.
     * @returns {Command}
     */
    static convertXMLCommandToObject(commandIq) {
        const from = commandIq.getAttribute('from');
        const id = commandIq.getAttribute('id');
        const command = commandIq.getElementsByTagName('command')[0];
        const commandType = command.getAttribute('type');

        let data;

        try {
            data = JSON.parse(command.textContent);
        } catch (e) {
            logger.error('Failed to parse command data');

            data = {};
        }

        return {
            commandType,
            data,
            from,
            id
        };
    }

    /**
     * @typedef {Object} Message - Information sent from one user to another.
     * This flow is currently used during proxy communication between the
     * participant in the Jitsi-Meet meeting and the Spot-Remote.
     *
     * @property {Object} data - The information of the message.
     * @property {string} from - The jid of the user sending the message.
     * @property {string} id - The message id attached to the message by prosody.
     * @property {string} messageType - The category of the message. Should be
     * one of the enumerated constants in {@code MESSAGES}.
     */

    /**
     * Converts a message embedded into an IQ into a plain JS object.
     *
     * @param {XML} messageIq - The message to convert.
     * @returns {Message}
     */
    static convertXMLMessageToObject(messageIq) {
        const from = messageIq.getAttribute('from');
        const id = messageIq.getAttribute('id');
        const message = messageIq.getElementsByTagName('message')[0];
        const messageType = message.getAttribute('type');
        let data;

        try {
            data = JSON.parse(message.textContent);
        } catch (e) {
            logger.error('Failed to parse message data');

            data = {};
        }

        return {
            data,
            from,
            id,
            messageType
        };
    }

    /**
     * @typedef {Object} Presence - Public information about a Spot-TV or
     * Spot-Remotes current status.
     *
     * @property {string} from - The jid of the user with the presence.
     * @property {string} type - The current overall status of the user. Examples
     * include "unavailable" and "error."
     * @property {Object} state - Current application state of the user.
     */

    /**
     * Converts a presence IQ into a plain JS object.
     *
     * @param {XML} presence - The presence to convert.
     * @returns {?Presence}
     */
    convertXMLPresenceToObject(presence) {
        const from = presence.getAttribute('from');
        let type = presence.getAttribute('type');

        if (!this._participants.has(from) && !type) {
            type = 'join';
        }

        const statusElement = presence.getElementsByTagNameNS('https://jitsi.org/spot', 'spot-status')[0];
        let state;

        try {
            state = statusElement ? JSON.parse(statusElement.textContent) : { };
        } catch (error) {
            logger.error('Failed to parse presence', {
                from,
                type
            });

            return undefined;
        }

        return {
            from,
            localUpdate: from === this.getRoomFullJid(),
            state,
            type
        };
    }
}
