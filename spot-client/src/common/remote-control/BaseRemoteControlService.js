import EventEmitter from 'events';
import { $iq } from 'strophe.js';

import { fetchRoomInfo } from 'common/backend/utils';
import { logger } from 'common/logger';
import { getJitterDelay } from 'common/utils';

import {
    CONNECTION_EVENTS,
    MESSAGES,
    SERVICE_UPDATES
} from './constants';
import XmppConnection from './xmpp-connection';

/**
 * The interface for interacting with the XMPP service which powers the
 * communication between a Spot instance and remote control instances. Both the
 * Spot instance and remote controls join the same MUC and can get messages to
 * each other.
 */
export class BaseRemoteControlService extends EventEmitter {
    /**
     * Initializes a new {@code RemoteControlService} instance.
     */
    constructor() {
        super();

        this._onCommandReceived = this._onCommandReceived.bind(this);
        this._onMessageReceived = this._onMessageReceived.bind(this);
        this._onPresenceReceived = this._onPresenceReceived.bind(this);

        /**
         * Whether or not the instance of {@code RemoteControlService} will be
         * used by a Spot-TV.
         */
        this._isSpot = false;
        this._lastSpotState = null;

        this._onDisconnect = this._onDisconnect.bind(this);

        window.addEventListener('beforeunload', () => this.disconnect());
    }

    /**
     * Creates a connection to the remote control service.
     *
     * @param {Object} options - Information necessary for creating the MUC.
     * @param {boolean} options.joinAsSpot - Whether or not this connection is
     * being made by a Spot client.
     * @param {string} options.joinCode - The code to use when joining or to set
     * when creating a new MUC.
     * @param {number} [options.joinCodeRefreshRate] - A duration in
     * milliseconds. If provided, a join code will be created and an interval
     * created to automatically update the join code at the provided rate.
     * @param {Object} options.serverConfig - Details on how the XMPP connection
     * should be made.
     * @returns {Promise<string>}
     */
    connect(options) {
        // Keep a cache of the initial options for reference when reconnecting.
        this._options = options;

        const {
            joinAsSpot,
            roomInfo,
            joinCodeRefreshRate,
            serverConfig
        } = this._options;

        this._isSpot = joinAsSpot;

        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.xmppConnection = new XmppConnection({
            configuration: serverConfig,
            onCommandReceived: this._onCommandReceived,
            onMessageReceived: this._onMessageReceived,
            onPresenceReceived: this._onPresenceReceived
        });

        this.xmppConnectionPromise = this.xmppConnection.joinMuc({
            joinAsSpot,
            roomName: roomInfo.roomName,
            roomLock: roomInfo.roomLock,
            onDisconnect: this._onDisconnect
        });

        this.xmppConnectionPromise
            .then(() => {
                if (joinAsSpot && joinCodeRefreshRate && this.refreshJoinCode) {
                    this.refreshJoinCode(joinCodeRefreshRate);
                }
            });

        return this.xmppConnectionPromise;
    }

    /**
     * Returns the current join code that is necessary to establish a connection
     * to a Spot-TV.
     *
     * @abstract
     * @returns {string}
     */
    getJoinCode() {
        throw new Error();
    }

    /**
     * Callback invoked when the xmpp connection is disconnected.
     *
     * @param {string} reason - The name of the disconnect event.
     * @private
     * @returns {void}
     */
    _onDisconnect(reason) {
        clearTimeout(this._nextJoinCodeUpdate);

        if (reason === CONNECTION_EVENTS.SPOT_TV_DISCONNECTED
            || reason === 'not-authorized') {
            this.emit(SERVICE_UPDATES.UNRECOVERABLE_DISCONNECT, { reason });

            return;
        }

        if (this._options.autoReconnect) {
            this._reconnect();
        }
    }

    /**
     * Attempt to re-create the XMPP connection.
     *
     * @private
     * @returns {void}
     */
    _reconnect() {
        if (this._isReconnectQueued) {
            logger.warn('reconnect called while already reconnecting');

            return;
        }

        this._isReconnectQueued = true;

        // wait a little bit to retry to avoid a stampeding herd
        const jitter = getJitterDelay();

        const previousJoinCode = this.getJoinCode();

        this.disconnect()
            .catch(error => {
                logger.error(
                    'an error occurred while trying to stop the service',
                    { error }
                );
            })
            .then(() => new Promise((resolve, reject) => {
                this._reconnectTimeout = setTimeout(() => {
                    logger.log('attempting reconnect');

                    this.connect({
                        ...this._options,
                        joinCode: previousJoinCode
                    })
                        .then(resolve)
                        .catch(reject);
                }, jitter);
            }))
            .then(() => {
                logger.log('loaded');

                this._isReconnectQueued = false;
            })
            .catch(error => {
                logger.warn('failed to load', { error });

                this._isReconnectQueued = false;

                this._onDisconnect(error);
            });
    }

    /**
     * Stops the XMPP connection.
     *
     * @returns {void}
     */
    disconnect() {
        this._lastSpotState = null;

        const destroyPromise = this.xmppConnection
            ? this.xmppConnection.destroy()
            : Promise.resolve();

        return destroyPromise
            .then(() => {
                this.xmppConnection = null;
                this.xmppConnectionPromise = null;
            });
    }

    /**
     * Converts a join code to Spot-TV connection information so it can be
     * connected to by a Spot-Remote.
     *
     * @param {string} code - The join code to exchange for connection information.
     * @param {string} joinCodeServiceUrl - The URL pointing to the join code service.
     * @returns {Promise<string>} Resolve with join information or an error.
     */
    exchangeCode(code = '', { joinCodeServiceUrl }) {
        if (joinCodeServiceUrl) {
            logger.log(`Will use ${joinCodeServiceUrl} to validate the join code...`);

            return fetchRoomInfo(joinCodeServiceUrl, code)
                .then(({ roomName, roomLock }) => {
                    return {
                        roomName,
                        roomLock
                    };
                });
        }

        const enteredCode = code.trim();

        if (enteredCode.length === 6) {
            return Promise.resolve({
                roomName: enteredCode.substring(0, 3),
                roomLock: enteredCode.substring(3, 6)
            });
        }

        return Promise.reject('Error with code.');
    }

    /**
     * Returns whether or not there is a connection that is being established
     * or is active.
     *
     * @returns {boolean}
     */
    hasConnection() {
        return Boolean(this.xmppConnection);
    }

    /**
     * Called internally by Spot-Remote to the Spot-TV jid for which to send
     * commands and messages.
     *
     * @private
     * @returns {string|null}
     */
    _getSpotId() {
        return this._lastSpotState && this._lastSpotState.spotId;
    }

    /**
     * Emits an event that a message or command has been received from an
     * instance of Spot Remote.
     *
     * @param {string} messageType - The constant of the message or command.
     * @param {Object} data - Additional details about the message.
     * @private
     * @returns {void}
     */
    _notifySpotRemoteMessageReceived(messageType, data) {
        this.emit(
            SERVICE_UPDATES.SPOT_REMOTE_MESSAGE_RECEIVED,
            messageType,
            data
        );
    }

    /**
     * Callback invoked when Spot-TV receives a command to take an action from
     * a Spot-Remove.
     *
     * @param {Object} iq -  The XML document representing the iq with the
     * command.
     * @private
     * @returns {Object} An ack of the iq.
     */
    _onCommandReceived(iq) {
        const from = iq.getAttribute('from');
        const command = iq.getElementsByTagName('command')[0];
        const commandType = command.getAttribute('type');

        logger.log('remoteControlService received command', { commandType });

        let data;

        try {
            data = JSON.parse(command.textContent);
        } catch (e) {
            logger.error('Failed to parse command data');

            data = {};
        }

        this._notifySpotRemoteMessageReceived(commandType, data);

        return $iq({
            id: iq.getAttribute('id'),
            type: 'result',
            to: from
        });
    }

    /**
     * Callback invoked when {@code XmppConnection} connection receives a
     * message iq that needs processing.
     *
     * @param {Object} iq - The XML document representing the iq with the
     * message.
     * @private
     * @returns {Object} An ack of the iq.
     */
    _onMessageReceived(iq) {
        // TODO: _onCommandReceived and _onMessageReceived have a lot of
        // duplication that may be remove-able.

        const from = iq.getAttribute('from');
        const message = iq.getElementsByTagName('message')[0];
        const messageType = message.getAttribute('type');

        logger.log('remoteControlService received message', { messageType });

        let data;

        try {
            data = JSON.parse(message.textContent);
        } catch (e) {
            logger.error('Failed to parse message data');

            data = {};
        }

        switch (messageType) {
        case MESSAGES.JITSI_MEET_UPDATE:
            // The Spot-Remote has an update from the Jitsi participant.
            this._screenshareConnection
                && this._screenshareConnection.processMessage({
                    data,
                    from
                });
            break;

        case MESSAGES.REMOTE_CONTROL_UPDATE:
            // Spot-TV received a message from a Spot-Remote to sent to the
            // Jitsi participant.
            this._notifySpotRemoteMessageReceived(
                MESSAGES.SPOT_REMOTE_PROXY_MESSAGE,
                {
                    data,
                    from
                }
            );

            break;
        }

        return $iq({
            id: iq.getAttribute('id'),
            to: from,
            type: 'result'
        });
    }

    /**
     * Callback invoked when Spot-TV or a Spot-Remote has a status update.
     * Spot-Remotes needs to know about Spot-TV state as well as connection
     * state, and Spot-TVs need to know about Spot-Remote disconnects for
     * screensharing.
     *
     * @param {Object} presence - The XML document representing the presence
     * update.
     * @private
     * @returns {Promise}
     */
    _onPresenceReceived(presence) {
        const updateType = presence.getAttribute('type');

        if (updateType === 'unavailable') {
            const from = presence.getAttribute('from');

            if (this._isSpot) {
                logger.log('presence update of a Spot-TV leaving', { from });

                // A Spot-TV needs to inform at least the Jitsi meeting that
                // a Spot-Remote has left, in case some cleanup of wireless
                // screensharing is needed.
                const iq = $iq({ type: 'set' })
                    .c('jingle', {
                        xmlns: 'urn:xmpp:jingle:1',
                        action: 'unavailable'
                    })
                    .c('details')
                    .t('unavailable')
                    .up();

                this._notifySpotRemoteMessageReceived(
                    MESSAGES.SPOT_REMOTE_LEFT,
                    {
                        from,
                        data: { iq: iq.toString() }
                    }
                );
            } else if (this._getSpotId() === from) {
                // A Spot-Remote needs to be updated about no longer being
                // connected to a Spot-TV.
                this._onDisconnect(CONNECTION_EVENTS.SPOT_TV_DISCONNECTED);
            }

            return;
        }

        if (this._isSpot) {
            // Spot-TV only needs to concern itself about leave events as its
            // state is known locally and then updated for Spot-Remotes.
            return;
        }

        if (updateType === 'error') {
            logger.log(
                'error presence received, interpreting as Spot-TV disconnect');
            this._onDisconnect(CONNECTION_EVENTS.SPOT_TV_DISCONNECTED);

            return;
        }

        const status = Array.from(presence.children).map(child =>
            [ child.tagName, child.textContent ])
            .reduce((acc, current) => {
                acc[current[0]] = current[1];

                return acc;
            }, {});

        if (status.isSpot !== 'true') {
            // Ignore presence from others not identified as a Spot-TV.
            return;
        }

        const spotTvJid = presence.getAttribute('from');

        // Redundantly update the known Spot-TV jid in case there are multiple
        // due to ghosts left form disconnect, in which case the active Spot-TV
        // should be emitting updates.
        this._lastSpotState = {
            ...status,
            spotId: spotTvJid
        };

        this.emit(
            SERVICE_UPDATES.SPOT_TV_STATE_CHANGE,
            {
                updatedState: this._lastSpotState
            }
        );
    }
}

export default BaseRemoteControlService;
