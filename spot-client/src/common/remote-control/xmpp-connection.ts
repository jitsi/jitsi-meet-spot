
import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';
import { getJitterDelay } from 'common/utils';
import { JitsiMeetJSProvider } from 'common/vendor';
import { $iq, Strophe } from 'strophe.js';

import { IQ_NAMESPACES, IQ_TIMEOUT } from './constants';


/**
 * XML element name for spot status added to MUC presence.
 */
const SPOT_STATUS_ELEMENT_NAME = 'spot-status';

/**
 * XML namespace for Spot specific XML.
 */
const SPOT_XMLNS = 'https://jitsi.org/spot';

/**
 * A request sent from one user to another to perform an action.
 */
interface Command {
    commandType: string | null;
    data: any;
    from: string | null;
    id: string | null;
}

/**
 * Information sent from one user to another. This flow is currently used during
 * proxy communication between the participant in the Jitsi-Meet meeting and the
 * Spot-Remote.
 */
interface Message {
    data: any;
    from: string | null;
    id: string | null;
    messageType: string | null;
}

/**
 * Public information about a Spot-TV or Spot-Remotes current status.
 */
interface Presence {
    from: string | null;
    localUpdate: boolean;
    state: any;
    type: string | null;
    unavailableReason: string | undefined;
}

/**
 * A promise with a cancel method attached, used to track the silent reconnect.
 */
interface CancelablePromise<T = void> extends Promise<T> {
    cancel: () => Promise<void>;
}

/**
 * Options passed to {@link XmppConnection#joinMuc}.
 */
interface JoinMucOptions {
    joinAsSpot?: boolean;
    getJwt?: () => string | undefined;
    resourceName?: string;
    retryOnUnauthorized?: boolean;
    roomLock?: string;
    onDisconnect: (...args: any[]) => void;
    roomName: string;
    shouldAttemptReconnect: () => boolean;
}

/**
 * Options used to construct an {@link XmppConnection} instance.
 */
interface XmppConnectionOptions {
    configuration: {
        bosh: string;
        websocket?: string;
        hosts?: {
            domain?: string;
            muc?: string;
        };
        [key: string]: any;
    };
    onCommandReceived?: (command: Command) => void;
    onMessageReceived?: (message: Message) => void;
    onPresenceReceived?: (presence: Presence) => void;
}

/**
 * Represents an XMPP connection to a prosody service.
 */
export default class XmppConnection extends Emitter {
    /**
     * Event emitted when a message with <refreshCalendar xmlns='jitsi.org/spot'/> is received, which means that
     * the app should update the calendar. It's placed weirdly inside the XmppConnection, because the message comes from
     * the Prosody module.
     */
    static CALENDAR_REFRESH_REQUESTED = 'CALENDAR_REFRESH_REQUESTED';

    /**
     * Event emitted when an XMPP MUC resource conflict is detected. Re-connection is automatic.
     */
    static CONFLICT = 'CONFLICT';

    /**
     * Event emitted when the {@link isConnected} status changes.
     */
    static CONNECTED_STATE_CHANGED = 'CONNECTED_STATE_CHANGED';

    options: XmppConnectionOptions;
    xmppConnection: any;
    room: any;
    initPromise: Promise<void> | null | undefined;

    _connectionEventHandlers: Set<any>;
    _participants: Set<string | null>;
    _spotStatus: Record<string, any>;
    _pendingIQRequestRejections: Set<(...args: any[]) => void>;
    _isXmppConnectionActive: boolean;
    _reconnectsAttempted: number;
    _hasJoinedMuc: boolean;
    _roomLock: string | null;
    _joinOptions!: JoinMucOptions;
    _conflictRetryTimeout: ReturnType<typeof setTimeout> | undefined;
    _isReconnecting: boolean | undefined;
    _silentReconnectPromise: CancelablePromise | undefined;

    /**
     * Initializes a new {@code XmppConnection} instance.
     *
     * @param options - Attributes to initialize the instance with.
     * @param options.configuration - Details of endpoints to use for
     * creating the XMPP connection.
     * @param options.configuration.bosh - The bosh url to use for
     * long-polling with the XMPP service.
     * @param options.configuration.hosts - Details of endpoints to use
     * for where to create the MUC.
     * @param options.configuration.hosts.domain - The overall domain
     * for which sub routes will be defined.
     * @param options.configuration.hosts.muc - Specifically the url
     * where MUCs should be created.
     * @param options.onCommandReceived - Callback to invoke when an
     * iq command is received.
     * @param options.onMessageReceived - Callback invoked  when an
     * iq message is received.
     * @param options.onPresenceReceived - Callback to invoke when
     * receiving a new presence.
     */
    constructor(options: XmppConnectionOptions) {
        super();
        this.options = options;

        /**
         * A cache of attached strophe handlers. They must be cached and removed
         * on disconnect to prevent strophe from calling them again.
         */
        this._connectionEventHandlers = new Set();

        this._participants = new Set();

        /**
         * The last known presence. Cached so that methods may perform a partial
         * update on it while prosody expects the full presence to be sent each
         * time.
         *
         * This state is not reset with other initial state because its value
         * may need to be kept on a silent reconnect.
         */
        this._spotStatus = {};

        /**
         * A reference to all rejection functions for IQ requests in flight.
         */
        this._pendingIQRequestRejections = new Set();

        /**
         * Flag set to {@code true} after the XMPP connection is established and MUC room joined. Reset on disconnect.
         *
         * @private
         */
        this._isXmppConnectionActive = false;

        /**
         * The number of consecutive reconnects of the XMPP connection that have
         * been attempted without success.
         */
        this._reconnectsAttempted = 0;

        this._hasJoinedMuc = false;
        this._roomLock = null;

        this._resetToInitialState();

        this._onCommand = this._onCommand.bind(this);
        this._onDisconnect = this._onDisconnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
        this._onPresence = this._onPresence.bind(this);
        this._onRefreshCalendarMsg = this._onRefreshCalendarMsg.bind(this);
    }

    /**
     * Aborts the silent reconnect if it's in progress.
     *
     * @returns {void}
     */
    abortReconnect(): void {
        this._silentReconnectPromise?.cancel();
    }

    /**
     * Establishes the XMPP connection with a jitsi deployment.
     *
     * @param options - Information necessary for creating the MUC.
     * @param options.joinAsSpot - Whether or not this connection is
     * being made by a Spot client.
     * @param options.getJwt - Callback to get the JWT token to be
     * used with the XMPP connection.
     * @param [options.resourceName] - The resource part of the MUC JID to be used(optional).
     * @param [options.retryOnUnauthorized] - Whether or not to retry
     * connection without a roomLock if an unauthorized error occurs.
     * @param [options.roomLock] - The lock code to use when joining or
     * to set when creating a new MUC.
     * @param options.onDisconnect - Callback to invoke when the
     * connection has been terminated without an explicit disconnect.
     * @param options.roomName - The name of the MUC to join or create.
     * @param options.shouldAttemptReconnect - Callback to invoke
     * when the XMPP connection experiences a reconnect and is about to silently
     * try to reconnect.
     * @returns - The promise resolves with the connection's
     * jid.
     */
    joinMuc(options: JoinMucOptions): Promise<void> {
        const {
            joinAsSpot,
            getJwt,
            resourceName,
            retryOnUnauthorized,
            roomLock,
            roomName
        } = options;

        if (this.initPromise) {
            logger.error('joinMuc called before another joinMuc job completed');

            return this.initPromise;
        }
        if (this._isXmppConnectionActive) {
            logger.error('joinMuc called while another connection is still active');
        }

        this._joinOptions = options;

        const JitsiMeetJS = JitsiMeetJSProvider.get();

        const bosh = `${this.options.configuration.bosh}?room=${roomName}`;
        const websocket = this.options.configuration.websocket
            ? `${this.options.configuration.websocket}?room=${roomName}`
            : undefined;
        const serviceUrl = websocket ?? bosh;

        this.xmppConnection = new JitsiMeetJS.JitsiConnection(
            null,
            getJwt && getJwt(),
            {
                ...this.options.configuration,
                serviceUrl
            }
        );

        const connectionEvents = JitsiMeetJS.events.connection;

        const connectionPromise = new Promise<void>((resolve, reject) => {
            this.xmppConnection.addEventListener(
                connectionEvents.CONNECTION_ESTABLISHED,
                () => {
                    this.xmppConnection.addEventListener(
                        connectionEvents.CONNECTION_FAILED,
                        this._onDisconnect);

                    resolve();
                }
            );

            this.xmppConnection.addEventListener(
                connectionEvents.CONNECTION_FAILED,
                reject
            );
        });

        this._connectionEventHandlers.add(
            this.xmppConnection.xmpp.connection.addHandler(
                this._onPresence,
                null,
                'presence',
                null,
                null
            )
        );

        this._connectionEventHandlers.add(
            this.xmppConnection.xmpp.connection.addHandler(
                this._onCommand,
                IQ_NAMESPACES.COMMAND,
                'iq',
                'set',
                null,
                null
            )
        );

        this._connectionEventHandlers.add(
            this.xmppConnection.xmpp.connection.addHandler(
                this._onMessage,
                IQ_NAMESPACES.MESSAGE,
                'iq',
                'set',
                null,
                null
            )
        );
        this._connectionEventHandlers.add(
            this.xmppConnection.xmpp.connection.addHandler(
                this._onRefreshCalendarMsg,
                'jitsi.org/spot',
                'message'
            )
        );

        const createJoinPromise = function(this: XmppConnection): Promise<void> {
            let firstConflictTimestamp: number | undefined;

            return new Promise<void>((resolve, reject) => {
                const { connection } = this.xmppConnection.xmpp;

                /**
                 * Callback invoked on the initial presence received from the MUC
                 * to determine a successful join.
                 *
                 * @param presence - The initial XML presence update.
                 * @returns False to unregister the handler from strophe.
                 */
                const onSuccessConnect = (presence: Element): boolean => {
                    const errors = presence.getElementsByTagName('error');

                    if (errors.length) {
                        const error = (errors[0].children[0] as Element).tagName;

                        if (error === 'conflict') {
                            if (!firstConflictTimestamp) {
                                firstConflictTimestamp = Date.now();
                            }

                            const timeSinceFirstConflict = Date.now() - firstConflictTimestamp;

                            logger.warn('Retry MUC join on conflict error', { timeSinceFirstConflict });
                            this._conflictRetryTimeout = setTimeout(() => this._joinMuc(roomLock), 5000);

                            this.emit(XmppConnection.CONFLICT);

                            return true;
                        }

                        reject(error);

                        return false;
                    }

                    this._hasJoinedMuc = true;

                    resolve();

                    return false;
                };

                // This is a generic presence handler that gets all presence,
                // including error and unavailable.
                this._connectionEventHandlers.add(
                    connection.addHandler(
                        onSuccessConnect,
                        null,
                        'presence',
                        null, // null to get passed all presence types into callback
                        null
                    )
                );
            });
        }.bind(this);

        const joinPromise = createJoinPromise();

        this.xmppConnection.connect();

        let mucJoinedPromise: Promise<void>;

        this.initPromise = connectionPromise
            .then(() => this._createMuc(roomName, resourceName))
            .then(room => {
                mucJoinedPromise = new Promise<void>(resolve => {
                    room.addEventListener('xmpp.muc_joined', () => {
                        resolve();
                    });
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
            .then(() => mucJoinedPromise)
            .then(() => {
                this.initPromise = undefined;
                this._isXmppConnectionActive = true;
                this.emit(XmppConnection.CONNECTED_STATE_CHANGED, this.isConnected());
            }, error => {
                this.initPromise = undefined;

                throw error;
            });

        return this.initPromise;
    }

    /**
     * Disconnects from any joined MUC and disconnects the XMPP connection.
     *
     * @param [event] - Optionally, the event which triggered the
     * necessity to disconnect from the XMPP server.
     * @returns {Promise}
     */
    destroy(event?: any): Promise<void> {
        clearTimeout(this._conflictRetryTimeout);
        this._conflictRetryTimeout = undefined;

        const leavePromise = this.xmppConnection
            ? this.xmppConnection.disconnect(event)
            : Promise.resolve();

        if (this.xmppConnection) {
            this._connectionEventHandlers.forEach(handler =>
                this.xmppConnection.xmpp.connection.deleteHandler(handler));

            this.xmppConnection.removeEventListener(
                JitsiMeetJSProvider.get().events.connection.CONNECTION_FAILED,
                this._onDisconnect
            );
        }

        return leavePromise
            .catch((error: any) =>
                logger.error('XmppConnection error on disconnect', { error }))
            .then(() => {
                this._connectionEventHandlers.clear();
                this._participants.clear();
                this._pendingIQRequestRejections.forEach(reject => reject());
                this._pendingIQRequestRejections.clear();
            });
    }

    /**
     * Returns whether or not the internal XMPP connection is active.
     *
     * @returns {boolean}
     */
    isConnected(): boolean {
        return this._isXmppConnectionActive;
    }

    /**
     * Returns whether or not the internal XMPP connection is being reconnected.
     *
     * @returns {boolean}
     */
    isReconnecting(): boolean {
        return Boolean(this._silentReconnectPromise) || Boolean(this.initPromise);
    }

    /**
     * Creates a MUC for the Spot and remote controllers to join to communicate
     * with each other.
     *
     * @param roomName - The name of the muc to create.
     * @param [resourceName] - An additional identifier to attach to
     * the MUC participant.
     * @returns The instance of the created muc.
     */
    _createMuc(roomName: string, resourceName?: string): any {
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
     * @param roomLock - A lock code, if any, to set in order to join the
     * muc.
     * @returns - A Promise resolved when libjitsi-meet's ChatRoom.join method is resolved
     * which is not exactly equal with being in the muc already.
     */
    _joinMuc(roomLock?: string): Promise<any> {
        // NOTE At the time of this writing lib-jitsi-meet resolves this promise without
        // waiting for the actually confirmation that the muc room has been joined.
        //
        // The 'roomLock' argument is optional on the lib-jitsi-meet side and it's fine to pass
        // undefined.
        return this.room.join(roomLock);
    }

    /**
     * Reset the simple instance variables stored to keep track of current
     * xmpp state.
     *
     * @private
     * @returns {void}
     */
    _resetToInitialState(): void {
        this._hasJoinedMuc = false;
        this.initPromise = null;
        this._isXmppConnectionActive = false;
        this._roomLock = null;
        this.room = null;
    }

    /**
     * Updates the current muc participant's status, which should notify other
     * participants of the update. This is a fire and forget call with no ack.
     *
     * @param newStatus - The presence values to be updated. The
     * key-values will override existing presence key-values and will not
     * override the complete presence.
     * @returns {void}
     */
    updateStatus(newStatus: Record<string, any> = {}): void {
        this._spotStatus = {
            ...this._spotStatus,
            ...newStatus
        };

        this.room?.addOrReplaceInPresence(
            SPOT_STATUS_ELEMENT_NAME, {
                value: JSON.stringify(this._spotStatus),
                attributes: {
                    xmlns: SPOT_XMLNS
                }
            }
        );

        this._sendPresence();
    }

    /**
     * Send a direct message to another participant in the muc.
     *
     * @param to - The JID to send the command to.
     * @param command - The command type to send.
     * @param data - Additional information about how to execute the
     * command.
     * @returns {Promise}
     */
    sendCommand(to: string, command: string, data: any = {}): Promise<any> {
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
            .then((responseIq: Element) => {
                const response = responseIq.getElementsByTagName('data')[0];

                return response ? JSON.parse(response.textContent ?? '') : {};
            });
    }

    /**
     * Send a message iq to another participant in the muc. A message expects
     * no immediate action taken in response.
     *
     * @param to - The jid to send the message to.
     * @param type - The message type to send.
     * @param data - Additional details to send.
     * @returns {Promise}
     */
    sendMessage(to: string, type: string, data: any): Promise<any> {
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
     * @param iq - The iq containing the response from a command.
     * @private
     * @returns {boolean}
     */
    _onCommand(iq: Element): boolean {
        const command = XmppConnection.convertXMLCommandToObject(iq);

        // FIXME: Correctly send back that command handling has not been initialized.
        if (this.options.onCommandReceived) {
            this.options.onCommandReceived(command);
        }

        const ack = $iq({
            type: 'result',
            ...(command.id ? { id: command.id } : {}),
            ...(command.from ? { to: command.from } : {})
        });

        this.room.connection.send(ack);

        return true;
    }

    /**
     * Callback invoked when an established xmpp connection has become disconnected.
     *
     * @param error - Represents the type of the error.
     * @param reason - Represents what caused the error.
     * @private
     * @returns {void}
     */
    _onDisconnect(error?: string, reason?: string): void {
        if (this._silentReconnectPromise || this._isReconnecting) {
            logger.error('Silent reconnect promise leak - onDisconnect executed twice?');
        }

        this._isXmppConnectionActive = false;
        this.emit(XmppConnection.CONNECTED_STATE_CHANGED, this.isConnected());

        if ((error === 'connection.droppedError'
            || error === 'connection.otherError'
            || error === 'item-not-found')
            && this._joinOptions.shouldAttemptReconnect()) {
            if (this._isReconnecting) {
                return;
            }

            this._reconnectsAttempted += 1;

            const reconnectJitter = getJitterDelay(Math.min(4, this._reconnectsAttempted), 1000, 3);

            this._isReconnecting = true;

            logger.warn('xmpp connection attempting silent reconnect', {
                error,
                jitter: reconnectJitter,
                reason,
                reconnectAttempts: this._reconnectsAttempted
            });

            // Flag flipped to true when abortReconnect() is called to cancel the silent reconnect.
            let canceled = false;

            const silentReconnectPromise = this.destroy()
                .then(() => new Promise<void>(resolveDelay => {
                    if (canceled) {
                        return;
                    }

                    setTimeout(resolveDelay, reconnectJitter);
                }))
                .then(() => {
                    if (canceled) {
                        return;
                    }

                    this._resetToInitialState();

                    return this.joinMuc(this._joinOptions);
                })
                .then(() => {
                    this._reconnectsAttempted = 0;
                    this._isReconnecting = false;
                    this._silentReconnectPromise = undefined;
                    if (!canceled) {
                        logger.log('xmpp connection silent reconnect complete');
                    }
                }, reconnectError => {
                    this._isReconnecting = false;
                    this._silentReconnectPromise = undefined;
                    if (!canceled) {
                        this._onDisconnect(reconnectError);
                    }
                }) as CancelablePromise;

            // Add cancel method
            silentReconnectPromise.cancel = () => {
                logger.log('canceling xmpp connection silent reconnect');
                canceled = true;

                return this.destroy().then(() => {
                    this._joinOptions.onDisconnect(error, reason);
                }, destroyErorr => {
                    logger.error('destroy rejected', { error: destroyErorr });
                    this._joinOptions.onDisconnect(error, reason);
                });
            };

            this._silentReconnectPromise = silentReconnectPromise;
        } else {
            this._joinOptions.onDisconnect(error, reason);
        }
    }

    /**
     * Callback invoked to process and acknowledge and incoming iq.
     *
     * @param iq - The iq containing a message.
     * @private
     * @returns {boolean}
     */
    _onMessage(iq: Element): boolean {
        const parsedIq = XmppConnection.convertXMLMessageToObject(iq);

        this.options.onMessageReceived?.(parsedIq);

        const ack = $iq({
            type: 'result',
            ...(parsedIq.id ? { id: parsedIq.id } : {}),
            ...(parsedIq.from ? { to: parsedIq.from } : {})
        });

        this.room.connection.send(ack);

        return true;
    }

    /**
     * Processing for the calendar refresh XMPP message.
     *
     * @param msg - The message element.
     * @private
     * @returns {void}
     */
    _onRefreshCalendarMsg(msg: Element): boolean {
        const refreshCalendar = msg.getElementsByTagNameNS('jitsi.org/spot', 'refreshCalendar').length > 0;

        if (refreshCalendar) {
            this.emit(XmppConnection.CALENDAR_REFRESH_REQUESTED);
        }

        return true;
    }

    /**
     * Returns the underlying {@link JitsiConnection} instance.
     *
     * @returns {JitsiMeetJS.JitsiConnection}
     */
    getJitsiConnection(): any {
        return this.xmppConnection;
    }

    /**
     * Returns the list of all known participants current connected.
     *
     * @returns {Set<string>}
     */
    getParticipantJids(): Set<string | null> {
        return new Set(this._participants);
    }

    /**
     * Removes a specified MUC participant.
     *
     * @param jid - The full jid of the participant to be removed.
     * @param [reason] - Additional information about why the removal
     * is occurring.
     * @returns {Promise}
     */
    kick(jid: string, reason = 'kicked'): Promise<any> {
        const kickIQ = $iq({
            to: this.room.roomjid,
            type: 'set'
        })
            .c('query', {
                xmlns: 'http://jabber.org/protocol/muc#admin'
            })
                .c('item', {
                    nick: Strophe.getResourceFromJid(jid),
                    role: 'none'
                })
                    .c('reason')
                        .t(reason)
                    .up()
                .up()
            .up();

        return this._sendIQ(kickIQ);
    }

    /**
     * The identifier for the local user in the MUC. Returns the full jid, which
     * has user@domain/resource.
     *
     * @returns {string}
     */
    getRoomFullJid(): string | undefined {
        return this.room?.myroomjid;
    }

    /**
     * Returns the current known lock on the MUC.
     *
     * @returns {string}
     */
    getLock(): string | null {
        return this._roomLock;
    }

    /**
     * Sets a new lock code on the current MUC.
     *
     * @param roomLock - The new code code to place on the MUC.
     * @returns {Promise}
     */
    setLock(roomLock: string): Promise<any> {
        this._roomLock = roomLock;

        return new Promise((resolve, reject) => {
            this.room.lockRoom(this._roomLock, resolve, reject, reject);
        });
    }

    /**
     * Callback invoked when the status of another participant in the muc has
     * changed.
     *
     * @param presence - Details of the current presence.
     * @private
     * @returns {boolean}
     */
    _onPresence(presence: Element): boolean {
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

        this.options.onPresenceReceived?.(parsedPresence);

        return true;
    }

    /**
     * Helper to encapsulate wrapping the IQ send in a promise. Stores a
     * reference to the IQ request in case pending requests need to be cleared,
     * which can happen when strophe disconnects but does not reject requests
     * in flight.
     *
     * @param iq - The IQ to send.
     * @private
     * @returns {Promise}
     */
    _sendIQ(iq: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this._pendingIQRequestRejections.add(reject);

            this.room.connection.sendIQ(
                iq,
                (...args: any[]) => {
                    this._pendingIQRequestRejections.delete(reject);
                    resolve(args[0]);
                },
                (...args: any[]) => {
                    this._pendingIQRequestRejections.delete(reject);
                    reject(args[0]);
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
    _sendPresence(): void {
        this.room?.sendPresence();
    }

    /**
     * Converts a command embedded into an IQ into a plain JS object.
     *
     * @param commandIq - The command to convert.
     * @returns {Command}
     */
    static convertXMLCommandToObject(commandIq: Element): Command {
        const from = commandIq.getAttribute('from');
        const id = commandIq.getAttribute('id');
        const command = commandIq.getElementsByTagName('command')[0];
        const commandType = command.getAttribute('type');

        let data;

        try {
            data = JSON.parse(command.textContent ?? '');
        } catch {
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
     * Converts a message embedded into an IQ into a plain JS object.
     *
     * @param messageIq - The message to convert.
     * @returns {Message}
     */
    static convertXMLMessageToObject(messageIq: Element): Message {
        const from = messageIq.getAttribute('from');
        const id = messageIq.getAttribute('id');
        const message = messageIq.getElementsByTagName('message')[0];
        const messageType = message.getAttribute('type');

        let data;

        try {
            data = JSON.parse(message.textContent ?? '');
        } catch {
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
     * Converts a presence IQ into a plain JS object.
     *
     * @param presence - The presence to convert.
     * @returns {?Presence}
     */
    convertXMLPresenceToObject(presence: Element): Presence | undefined {
        const from = presence.getAttribute('from');
        const statusCodes = Array.from(presence.getElementsByTagName('status'))
            .map(statusEl => statusEl.getAttribute('code'));

        let type = presence.getAttribute('type');

        // Assume unknown participant presence indicates a join.
        if (!this._participants.has(from) && !type) {
            type = 'join';
        }

        const parsedPresence: Presence = {
            from,
            localUpdate: statusCodes.includes('110'),
            state: undefined,
            type,
            unavailableReason: undefined
        };

        if (type === 'unavailable') {
            if (statusCodes.includes('307')) {
                parsedPresence.unavailableReason = 'kicked';
            }

            return parsedPresence;
        }

        try {
            const statusElement = presence.getElementsByTagNameNS('https://jitsi.org/spot', 'spot-status')[0];

            parsedPresence.state = statusElement ? JSON.parse(statusElement.textContent ?? '') : {};
        } catch (error: any) {
            logger.error('Failed to parse presence', {
                errorMsg: error.message,
                from,
                type
            });

            return undefined;
        }

        return parsedPresence;
    }
}
