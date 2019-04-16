import EventEmitter from 'events';
import { $iq } from 'strophe.js';

import { fetchRoomInfo } from 'common/backend/utils';
import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';
import { getJitterDelay } from 'common/utils';

import {
    COMMANDS,
    CONNECTION_EVENTS,
    MESSAGES,
    SERVICE_UPDATES
} from './constants';
import ScreenshareService from './screenshare-connection';
import XmppConnection from './xmpp-connection';


/**
 * Temporary method to generate a random string, intended to be used to
 * create a random join code.
 *
 * @param {number} length - The desired length of the random string.
 * @returns {string}
 */
function generateRandomString(length) {
    return Math.random()
        .toString(36)
        .substr(2, length);
}

/**
 * @typedef {Object} GoToMeetingOptions
 * @property {string} startWithScreensharing - if 'wireless' the meeting will be joined with
 * the wireless screensharing turned on. If 'wired' will be joined with wired. The meeting will be
 * joined without screensharing for any other value or lack of thereof.
 */

/**
 * The interface for interacting with the XMPP service which powers the
 * communication between a Spot instance and remote control instances. Both the
 * Spot instance and remote controls join the same MUC and can get messages to
 * each other.
 */
class RemoteControlService extends EventEmitter {
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

        this._wirelessScreensharingConfiguration = null;

        window.addEventListener('beforeunload', () => this.disconnect());
    }

    /**
     * Stores options related to wireless screensharing which will be to passed
     * into the wireless screensharing service upon screenshare start.
     *
     * @param {Object} configuration - A configuration file for how the wireless
     * screensharing should be captured.
     * @param {Object} configuration.maxFps - The maximum number of frame per
     * second which should be captured from the sharer's device.
     * @returns {void}
     */
    configureWirelessScreensharing(configuration = {}) {
        this._wirelessScreensharingConfiguration = configuration;
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
            joinCode,
            joinCodeRefreshRate,
            serverConfig,
            joinCodeServiceUrl
        } = this._options;

        this._isSpot = joinAsSpot;

        if (this.xmppConnectionPromise) {
            return this.xmppConnectionPromise;
        }

        this.joinCodeServiceUrl = joinCodeServiceUrl;
        this.xmppConnection = new XmppConnection({
            configuration: serverConfig,
            onCommandReceived: this._onCommandReceived,
            onMessageReceived: this._onMessageReceived,
            onPresenceReceived: this._onPresenceReceived
        });

        let getRoomInfoPromise;

        if (this.joinCodeServiceUrl) {
            getRoomInfoPromise = fetchRoomInfo(this.joinCodeServiceUrl, joinCode);
        } else if (joinCode) {
            getRoomInfoPromise = Promise.resolve({
                roomName: joinCode.substring(0, 3),
                roomLock: joinCode.substring(3, 6)
            });
        } else {
            getRoomInfoPromise = Promise.resolve({
                // If none joinCode is present then create a room and let the lock
                // be set later. Setting the lock on join will throw an error about
                // not being authorized..
                roomName: generateRandomString(3)
            });
        }

        this.xmppConnectionPromise
            = getRoomInfoPromise
                .then(roomInfo => this.xmppConnection.joinMuc({
                    joinAsSpot,
                    roomName: roomInfo.roomName,
                    roomLock: roomInfo.roomLock,
                    onDisconnect: this._onDisconnect
                }));


        this.xmppConnectionPromise
            .then(() => {
                if (joinAsSpot && joinCodeRefreshRate) {
                    this.refreshJoinCode(joinCodeRefreshRate);
                }
            });

        return this.xmppConnectionPromise;
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
            this.emit(SERVICE_UPDATES.DISCONNECT, { reason });

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

        const previousJoinCode = this._isSpot
            ? this.getJoinCode()
            : (this._lastSpotState && this._lastSpotState.joinCode)
                || this._options.joinCode;

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
     * Stops any active {@code ScreenshareConnection}.
     *
     * @returns {void}
     */
    destroyWirelessScreenshareConnections() {
        if (this._screenshareConnection) {
            this._screenshareConnection.stop();
            this._screenshareConnection = null;
        }

        if (this._startWithScreenshare) {
            this._startWithScreenshare.stop();
            this._startWithScreenshare = null;
        }
    }

    /**
     * Stops the XMPP connection.
     *
     * @returns {void}
     */
    disconnect() {
        this.destroyWirelessScreenshareConnections();

        this._lastSpotState = null;

        clearTimeout(this._nextJoinCodeUpdate);

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
     * @param {string} code - The join code to exchange for connection
     * information.
     * @returns {Promise<string>} Resolve with join information or an error.
     */
    exchangeCode(code = '') {
        return new Promise((resolve, reject) => {
            const enteredCode = code.trim();

            if (enteredCode.length === 6) {
                resolve(code.trim());
            } else {
                reject('Error with code.');
            }
        });
    }

    /**
     * Returns the current join code that is necessary to establish a connection
     * to a Spot-TV.
     *
     * @returns {string}
     */
    getJoinCode() {
        const fullJid
            = this.xmppConnection && this.xmppConnection.getRoomFullJid();

        if (!fullJid) {
            return '';
        }

        const roomName = fullJid.split('@')[0];
        const roomLock = this.xmppConnection.getLock();

        return `${roomName}${roomLock}`;
    }

    /**
     * Requests a Spot to join a meeting.
     *
     * @param {string} meetingName - The meeting to join.
     * @param {GoToMeetingOptions} options - Additional details about how to join the
     * meeting.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    goToMeeting(meetingName, options = {}) {
        const { startWithScreensharing, ...otherOptions } = options;
        let preGoToMeeting = Promise.resolve();

        if (startWithScreensharing === 'wireless') {
            const connection = this._createScreensharingService(otherOptions);

            preGoToMeeting = connection.createTracks()
                .then(() => {
                    this._startWithScreenshare = connection;
                });
        }

        return preGoToMeeting
            .then(() => this.xmppConnection.sendCommand(
                    this._getSpotId(),
                    COMMANDS.GO_TO_MEETING,
                    {
                        startWithScreensharing: startWithScreensharing === 'wired',
                        startWithVideoMuted: startWithScreensharing === 'wireless',
                        ...otherOptions,
                        meetingName
                    })
            );
    }

    /**
     * Requests a Spot-TV to leave a meeting in progress.
     *
     * @param {boolean} skipFeedback - Whether or not to immediately navigate
     * out of the meeting instead of display feedback entry.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    hangUp(skipFeedback = false) {
        this.destroyWirelessScreenshareConnections();

        return this.xmppConnection.sendCommand(
            this._getSpotId(),
            COMMANDS.HANG_UP,
            {
                skipFeedback
            }
        );
    }

    /**
     * Method invoked by Spot-TV to generate a new join code for a Spot-Remote
     * to pair with it.
     *
     * @param {number} nextRefreshTimeout - If defined will start an interval
     * to automatically update join code.
     * @returns {Promise<string>} Resolves with the new join code.
     */
    refreshJoinCode(nextRefreshTimeout) {
        clearTimeout(this._nextJoinCodeUpdate);

        const roomLock = generateRandomString(3);

        this.xmppConnection.setLock(roomLock)
            .then(() => {
                this.emit(
                    SERVICE_UPDATES.JOIN_CODE_CHANGE,
                    { joinCode: this.getJoinCode() }
                );

                if (nextRefreshTimeout) {
                    this._nextJoinCodeUpdate = setTimeout(() => {
                        this.refreshJoinCode(nextRefreshTimeout);
                    }, nextRefreshTimeout);
                }
            });
    }

    /**
     * Sends a message to a Spot-Remote.
     *
     * @param {string} jid - The jid of the remote control which should receive
     * the message.
     * @param {Object} data - Information to pass to the remote control.
     * @returns {Promise}
     */
    sendMessageToRemoteControl(jid, data) {
        return this.xmppConnection.sendMessage(
            jid, MESSAGES.JITSI_MEET_UPDATE, data);
    }

    /**
     * Requests a Spot-TV to change its audio mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be audio muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setAudioMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_AUDIO_MUTE, { mute });
    }

    /**
     * Requests a Spot-TV to change its screensharing status. Turning on the
     * screensharing will enable wired screensharing, while turning off applies
     * to both wired and wireless screensharing.
     *
     * @param {boolean} screensharing - Whether or not Spot-TV should start or
     * stop screensharing.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setScreensharing(screensharing) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(),
            COMMANDS.SET_SCREENSHARING,
            { on: screensharing }
        );
    }

    /**
     * Requests a Spot-TV to change its video mute status.
     *
     * @param {boolean} mute - Whether or not Spot should be video muted.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    setVideoMute(mute) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SET_VIDEO_MUTE, { mute });
    }

    /**
     * Begins or stops the process for a Spot-Remote to connect to the local
     * in-meeting Jitsi in order to directly share a local screen.
     *
     * @param {boolean} enable - Whether to start ot stop screensharing.
     * @param {Object} options - Additional configuration to use for creating
     * the screenshare connection.
     * @returns {Promise}
     */
    setWirelessScreensharing(enable, options) {
        return enable
            ? this._startWirelessScreenshare(undefined, options)
            : this._stopWirelessScreenshare();
    }

    /**
     * Triggers any stored wireless screesharing connections to start the
     * process of establishing a connection to a a local Jitsi meeting
     * participant.
     *
     * @returns {void}
     */
    startAnyDeferredWirelessScreenshare() {
        if (!this._startWithScreenshare) {
            // No wireless screenshare to start.
            return;
        }

        this._startWirelessScreenshare(this._startWithScreenshare)
            .then(() => logger.log('Start with screensharing successful'))
            .catch(error => logger.error(
                'Failed to start with screensharing', { error }));

        this._startWithScreenshare = null;
    }

    /**
     * Requests a Spot to change submit meeting feedback.
     *
     * @param {Object} feedback - The feedback to submit.
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    submitFeedback(feedback) {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.SUBMIT_FEEDBACK, feedback);
    }

    /**
     * To be called by Spot-TV to update self presence.
     *
     * @param {Object} newStatus - The new presence object that should be merged
     * with existing presence.
     * @returns {void}
     */
    updateStatus(newStatus = {}) {
        // FIXME: these truthy checks also fix a condition where updateStatus
        // is fired when the redux store is initialized.
        if (!this.xmppConnection || !this._isSpot) {
            return;
        }

        this.xmppConnection.updateStatus(newStatus);
    }

    /**
     * Invoked by a Spot-Remote to initialize a new {@link ScreenshareService}
     * instance.
     *
     * @param {Object} options - Additional configuration to use for creating
     * the screenshare connection.
     * @private
     * @returns {ScreenshareService}
     */
    _createScreensharingService(options = {}) {
        return new ScreenshareService({
            mediaConfiguration:
                this._wirelessScreensharingConfiguration || {},

            /**
             * The {@code JitsiConnection} instance will be used to fetch TURN credentials.
             */
            jitsiConnection: this.xmppConnection.getJitsiConnection(),

            /**
             * Callback invoked when the connection has been closed
             * automatically. Triggers cleanup of {@code ScreenshareService}.
             *
             * @returns {void}
             */
            onConnectionClosed: () => {
                this._stopWirelessScreenshare();
                options.onClose && options.onClose();
            },

            /**
             * Callback invoked by {@code ScreenshareService} in order to
             * communicate out to a Spot-TV an update about the screensharing
             * connection.
             *
             * @param {string} to - The Spot-TV jid to send the message to.
             * @param {Object} data - A payload to send along with the
             * message.
             * @returns {Promise}
             */
            sendMessage: (to, data) =>
                this.xmppConnection.sendMessage(
                    to,
                    MESSAGES.REMOTE_CONTROL_UPDATE,
                    data
                ).catch(error => logger.error(
                    'Failed to send screensharing message', { error }))
        });
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

    /**
     * Begins the process of Spot-Remote creating a direct connection to the
     * local in-meeting Jitsi participant.
     *
     * @param {ScreenshareConnection} connection - Optionally use an existing
     * instance of ScreenshareConnection instead of instantiating one. This
     * would be used when creating a desktop track to stream first but the
     * actual connection to the JItsi participant must occur later.
     * @param {Object} options - Additional configuration to use for creating
     * the screenshare connection.
     * @private
     * @returns {void}
     */
    _startWirelessScreenshare(connection, options) {
        if (this._screenshareConnection) {
            logger.error('Already started wireless screenshare');

            return Promise.reject('Already started wireless screenshare');
        }

        this._screenshareConnection
            = connection || this._createScreensharingService(options);

        return this._screenshareConnection.startScreenshare(this._getSpotId())
            .catch(error => {
                logger.error(
                    'Could not establish wireless screenshare connection',
                    { error }
                );

                this.destroyWirelessScreenshareConnections();

                return Promise.reject(error);
            });
    }

    /**
     * Cleans up screensharing connections between the Spot-Remote and Jitsi
     * participant that are pending or have successfully been made.
     *
     * @private
     * @returns {Promise}
     */
    _stopWirelessScreenshare() {
        this.destroyWirelessScreenshareConnections();

        return this.setScreensharing(false);
    }
}

const remoteControlService = new RemoteControlService();

globalDebugger.register('remoteControlService', remoteControlService);

export default remoteControlService;
