import { $iq } from 'strophe.js';

import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';

import { COMMANDS, MESSAGES } from './constants';
import ScreenshareService from './screenshare-connection';
import XmppConnection from './xmpp-connection';

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
class RemoteControlService {
    /**
     * Initializes a new {@code RemoteControlService} instance.
     */
    constructor() {
        /**
         * Callbacks to invoke as commands and presence updates are received.
         *
         * @type {Set<Function>}
         */
        this._remoteMessageListeners = new Set();

        this._onCommandReceived = this._onCommandReceived.bind(this);
        this._onMessageReceived = this._onMessageReceived.bind(this);
        this._onPresenceReceived = this._onPresenceReceived.bind(this);

        /**
         * Whether or not the instance of {@code RemoteControlService} will be
         * used by a Spot-TV.
         */
        this._isSpot = false;
        this._spotTvJid = null;

        this._onDisconnect = null;
        this._onSpotUpdate = null;

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
     * @param {string} options.lock - The lock code to use when joining or
     * to set when creating a new MUC.
     * @param {Function} options.onDisconnect - Callback to invoke when the
     * connection has been terminated unexpectedly.
     * @param {Function} options.onSpotUpdate - Callback to invoke when a new
     * presence is received from a Spot-TV.
     * @param {string} options.roomName - The name of the MUC to join or create.
     * @param {Object} options.serverConfig - Details on how the XMPP connection
     * should be made.
     * @returns {Promise<string>}
     */
    connect({ joinAsSpot, lock, onDisconnect, onSpotUpdate, roomName, serverConfig }) {
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
            lock,
            roomName,
            onDisconnect
        });

        this._onDisconnect = onDisconnect;
        this._onSpotUpdate = onSpotUpdate;

        return this.xmppConnectionPromise;
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

        this._onDisconnect = null;
        this._onSpotUpdate = null;
        this._spotTvJid = null;

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
     * Returns the current MUC that is joined to use as signaling between a Spot
     * and remote controls.
     *
     * @returns {string}
     */
    getRoomName() {
        const fullJid
            = this.xmppConnection && this.xmppConnection.getRoomFullJid();

        if (!fullJid) {
            return '';
        }

        return fullJid.split('@')[0];
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
            const connection = this._createScreensharingService();

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
     * @returns {Promise} Resolves if the command has been acknowledged.
     */
    hangUp() {
        return this.xmppConnection.sendCommand(
            this._getSpotId(), COMMANDS.HANG_UP);
    }

    /**
     * Registers a callback to be notified of incoming command and message IQs.
     *
     * @param {Function} listener - The callback to invoke. Will be passed the
     * command or message type and any associated payload.
     * @returns {void}
     */
    startListeningForRemoteMessages(listener) {
        this._remoteMessageListeners.add(listener);
    }

    /**
     * Notifies all Spot-Remotes about a change in known calendar events.
     *
     * @param {Array<Object>} events - The calendar events for Spot-TV.
     * @returns {void}
     */
    notifyCalendarStatus(events) {
        this.xmppConnection.updateStatus('calendar', events);
    }

    /**
     * Notifies all Spot-Remotes of the current join code for a Spot-TV.
     *
     * @param {string} joinCode - The join code necessary for a user to connect
     * a Spot-Remote to a Spot-TV.
     * @returns {void}
     */
    notifyJoinCodeUpdate(joinCode) {
        this.xmppConnection.updateStatus('joinCode', joinCode);
    }

    /**
     * Notifies all Spot-Remotes about the the current availability of wired
     * screensharing on a Spot-TV.
     *
     * @param {boolean} isEnabled - Whether or not screensharing is possible.
     * @returns {void}
     */
    notifyWiredScreenshareEnabled(isEnabled) {
        this.xmppConnection.updateStatus(
            'wiredScreensharingEnabled', isEnabled);
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
     * Requests the lock on a MUC be changed.
     *
     * @param {string} lock - The new lock to set on the room.
     * @returns {Promise}
     */
    setLock(lock) {
        return this.xmppConnection.setLock(lock);
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
     * @returns {Promise}
     */
    setWirelessScreensharing(enable) {
        return enable
            ? this._startWirelessScreenshare()
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
     * De-registers a callback for when a command or message IQ is received.
     *
     * @param {Function} listener - The callback which should no longer be
     * notified.
     * @returns {void}
     */
    stopListeningForRemoteMessages(listener) {
        this._remoteMessageListeners.delete(listener);
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
     * @param {Object} newState - The presence values to be updated. The
     * key-values will override existing presence key-values and will not
     * override the complete presence.
     * @returns {void}
     */
    updateStatus(newState = {}) {
        // FIXME: these truthy checks also fix a condition where updateStatus
        // is fired when the redux store is initialized.
        if (!this.xmppConnection || !this._isSpot) {
            return;
        }

        Object.keys(newState).forEach(key => {
            this.xmppConnection.updateStatus(key, newState[key]);
        });
    }

    /**
     * Invoked by a Spot-Remote to initialize a new {@link ScreenshareService}
     * instance.
     *
     * @private
     * @returns {ScreenshareService}
     */
    _createScreensharingService() {
        return new ScreenshareService({
            mediaConfiguration:
                this._wirelessScreensharingConfiguration || {},

            /**
             * Callback invoked when the connection has been closed
             * automatically. Triggers cleanup of {@code ScreenshareService}.
             *
             * @returns {void}
             */
            onConnectionClosed: () => this._stopWirelessScreenshare(),

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
                ).catch(error => logger.error(error))
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
        return this._spotTvJid;
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

        this._remoteMessageListeners.forEach(cb => cb(commandType, data));

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
            this._remoteMessageListeners.forEach(cb => cb(
                MESSAGES.SPOT_REMOTE_PROXY_MESSAGE,
                {
                    data,
                    from
                }
            ));

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

                this._remoteMessageListeners.forEach(cb => cb(
                    MESSAGES.SPOT_REMOTE_LEFT,
                    {
                        from,
                        data: { iq: iq.toString() }
                    }
                ));
            } else if (this._getSpotId() === from) {
                // A Spot-Remote needs to be updated about no longer being
                // connected to a Spot-TV.
                this._onDisconnect(true);
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
                'error presence received, interpretting as Spot-TV disconnect');
            this._onDisconnect(true);

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

        // Redundantly update the knwon Spot-TV jid in case there are multiple
        // due to ghosts left form disconnect, in which case the active Spot-TV
        // should be emitting updates.
        this._spotTvJid = spotTvJid;

        const newState = {
            ...status,
            spotId: spotTvJid
        };

        this._onSpotUpdate(newState);
    }

    /**
     * Begins the process of Spot-Remote creating a direct connection to the
     * local in-meeting Jitsi participant.
     *
     * @param {ScreenshareConnection} connection - Optionally use an existing
     * instance of ScreenshareConnection instead of instantiating one. This
     * would be used when creating a desktop track to stream first but the
     * actual connection to the JItsi participant must occur later.
     * @private
     * @returns {void}
     */
    _startWirelessScreenshare(connection) {
        if (this._screenshareConnection) {
            logger.error('Already started wireless screenshare');

            return Promise.reject('Already started wireless screenshare');
        }

        this._screenshareConnection
            = connection || this._createScreensharingService();

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
     * @returns {void}
     */
    _stopWirelessScreenshare() {
        this.setScreensharing(false);
        this.destroyWirelessScreenshareConnections();
    }
}

const remoteControlService = new RemoteControlService();

globalDebugger.register('remoteControlService', remoteControlService);

export default remoteControlService;
