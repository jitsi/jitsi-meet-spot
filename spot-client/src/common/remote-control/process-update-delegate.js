import { $iq } from 'strophe.js';

import {
    setCalendarEvents,
    setSpotLeft,
    updateSpotState
} from 'common/actions';
import { logger } from 'common/logger';
import {
    getCalendarEvents,
    getInMeetingStatus,
    getMeetingApi,
    getSpotId,
    isSpot
} from 'common/reducers';

import { COMMANDS, MESSAGES } from './constants';
import { hasUpdatedEvents } from '../utils/hasUpdatedEvents';

/**
 * Presence attributes from Spot convert to boolean and store in redux.
 *
 * @type {Set}
 */
const presenceToStoreAsBoolean = new Set([
    'audioMuted',
    'screensharing',
    'videoMuted',
    'wiredScreensharingEnabled'
]);

/**
 * Presence attributes from Spot convert to store as strings in redux.
 *
 * @type {Set}
 */
const presenceToStoreAsString = new Set([
    'inMeeting',
    'joinCode',
    'view'
]);

/**
 * A class with methods for processing XMPP iqs and presence changes and
 * updating app state as needed.
 */
export default class ProcessUpdateDelegate {
    /**
     * Initializes a new {@code ProcessUpdateDelegate} instance.
     *
     * @param {Object} store - The redux store in which app data is held.
     * @param {Object} history - The router which controls page navigation.
     */
    constructor(store, history) {
        this._store = store;
        this._history = history;

        /**
         * Send a dying request to close any active ScreenShare connection so
         * the Jitsi-Meet meeting knows to stop showing a screenshare.
         */
        window.addEventListener('beforeunload', () => this.stopScreenshare());
    }

    /**
     * Returns the Spot of the current muc.
     *
     * @returns {string|null}
     */
    getSpotId() {
        return getSpotId(this._store.getState());
    }

    /**
     * Callback to invoke when receiving a remote control command as an iq.
     *
     * @param {Object} iq - The iq representing the command to take an action.
     * @returns {Object} An ack as an iq.
     */
    onCommand(iq) {
        const from = iq.getAttribute('from');
        const command = iq.getElementsByTagName('command')[0];
        const commandType = command.getAttribute('type');
        const ack = $iq({ type: 'result',
            to: from,
            id: iq.getAttribute('id')
        });

        let data;

        try {
            data = JSON.parse(command.textContent);
        } catch (e) {
            logger.error('processUpdateDelegate failed to parse command data');

            return ack;
        }

        logger.log(`processUpdateDelegate received command: ${commandType}`);

        switch (commandType) {
        case COMMANDS.GO_TO_MEETING: {
            logger.log('processUpdateDelegate going to meeting');

            let path = `/meeting?location=${data.meetingName}`;

            if (data.invites) {
                logger.log('has invites for the meeting');

                path += `&invites=${JSON.stringify(data.invites)}`;
            }

            this._history.push(path);
            break;
        }

        case COMMANDS.HANG_UP:
            this._executeIfInMeeting('hangup');
            break;

        case COMMANDS.SET_AUDIO_MUTE: {
            const { audioMuted } = getInMeetingStatus(this._store.getState());

            if (audioMuted !== data.mute) {
                this._executeIfInMeeting('toggleAudio');
            }
            break;
        }

        case COMMANDS.SET_SCREENSHARING: {
            const { screensharing }
                = getInMeetingStatus(this._store.getState());

            if (screensharing !== data.on) {
                this._executeIfInMeeting('toggleShareScreen');
            }

            break;
        }

        case COMMANDS.SET_VIDEO_MUTE: {
            const { videoMuted } = getInMeetingStatus(this._store.getState());

            if (videoMuted !== data.mute) {
                this._executeIfInMeeting('toggleVideo');
            }

            break;
        }

        case COMMANDS.SUBMIT_FEEDBACK: {
            const meetingApi = getMeetingApi(this._store.getState());

            // Check against the meeting api existence because feedback can be
            // submitted after the meeting has ended.
            if (meetingApi) {
                logger.log('processUpdateDelegate submitting feedback');

                meetingApi.executeCommand('submitFeedback', data);
            }

            break;
        }
        }

        return ack;
    }

    /**
     * Callback to invoke when receiving a message as an iq.
     *
     * @param {Object} iq - The iq representing the message.
     * @returns {Object} A ack as an iq.
     */
    onMessage(iq) {
        const from = iq.getAttribute('from');
        const message = iq.getElementsByTagName('message')[0];
        const messageType = message.getAttribute('type');
        const data = JSON.parse(message.textContent);
        const ack = $iq({
            id: iq.getAttribute('id'),
            to: from,
            type: 'result'
        });

        logger.log(`processUpdateDelegate received message: ${messageType}`);

        switch (messageType) {
        case MESSAGES.JITSI_MEET_UPDATE:
            // It is currently assumed all messages received here are for the
            // remote control, are from the Jitsi-Meet participant, and are all
            // related to screensharing.
            this._screenshareConnection
                && this._screenshareConnection.processMessage({
                    data,
                    from
                });

            break;

        case MESSAGES.REMOTE_CONTROL_UPDATE:
            // Spot receives messages from remote controls to pass to
            // Jitsi-Meet.
            this._sendEventIfInMeeting({
                data,
                from
            });

            break;
        }

        return ack;
    }

    /**
     * Callback to invoke when Spot has a presence update so the app state
     * can be synced with Spot's current presence.
     *
     * @param {Object} presence - The presence update in XML format.
     * @returns {void}
     */
    onStatus(presence) {
        const localIsSpot = isSpot(this._store.getState());
        const updateType = presence.getAttribute('type');

        if (updateType === 'unavailable') {
            logger.log('processUpdateDelegate presence update of a leave');

            const from = presence.getAttribute('from');

            if (from === this.getSpotId()) {
                logger.log(`processUpdateDelegate spot left ${from}`);

                // When Spot has left, trigger screenshare cleanup to stop any
                // active {@code ScreenshareConnection} and its associated
                // media.
                this.stopScreenshare();

                this._store.dispatch(setSpotLeft());
            } else {
                logger.log(`processUpdateDelegate remote left ${from}`);

                // When a remote leaves, notify the Jitsi-Meet meeting so that
                // it can trigger any cleanup of active direct connections to a
                // remote control.
                const iq = $iq({ type: 'set' })
                    .c('jingle', {
                        xmlns: 'urn:xmpp:jingle:1',
                        action: 'unavailable'
                    })
                    .c('details')
                    .t('unavailable')
                    .up();
                const stringifiedIq = iq.toString();

                this._sendEventIfInMeeting({
                    from,
                    data: { iq: stringifiedIq }
                });
            }

            return;
        }

        if (updateType === 'error') {
            logger.log('processUpdateDelegate presence error');

            if (!localIsSpot) {
                logger.log('processUpdateDelegate triggering disconnect');

                this._store.dispatch(setSpotLeft());

                return Promise.resolve();
            }
        }

        const status = Array.from(presence.children).map(child =>
            [ child.tagName, child.textContent ])
            .reduce((acc, current) => {
                acc[current[0]] = current[1];

                return acc;
            }, {});

        if (status.isSpot !== 'true') {
            return;
        }

        const from = presence.getAttribute('from');
        const newState = {
            spotId: from
        };

        Object.keys(status).forEach(key => {
            if (presenceToStoreAsBoolean.has(key)) {
                newState[key] = status[key] === 'true';
            } else if (presenceToStoreAsString.has(key)) {
                newState[key] = status[key];
            }
        });

        const { inMeeting } = getInMeetingStatus(this._store.getState());

        if (inMeeting && !newState.inMeeting) {
            this.stopScreenshare();
        }

        logger.log(`processUpdateDelegate new spot state ${
            JSON.stringify(newState)}`);

        this._store.dispatch(updateSpotState(newState));

        // For remote controls and for consistent implementation, update the
        // redux store through the calendar event flow that a Spot would use.
        if (status.calendar && !localIsSpot) {
            try {
                const events = JSON.parse(status.calendar);
                const hasUpdate = hasUpdatedEvents(
                    getCalendarEvents(this._store.getState()),
                    events
                );

                if (hasUpdate) {
                    this._store.dispatch(setCalendarEvents(events));
                }
            } catch (e) {
                logger.error('Error while parsing Spot calendar events:', e);
            }
        }

        return;
    }

    /**
     * Begins the screensharing connection establishment processes between a
     * remote control and a Jitsi-Meet meeting.
     *
     * @param {string} spotId - The jid of the Spot to use as a signaling layer
     * for establishing a screenshare connection. Messages go to Spot for it
     * to pass into the meeting.
     * @param {string} roomFullJId - The jid of the remote control that wants
     * to establish a {@code ScreenshareConnection}.
     * @param {Object} screenshareConnection - The instance of
     * {@code ScreenshareConnection} to be used.
     * @returns {Promise<string|void>} Resolves with void when void the
     * screensharing process has been started successfully. This resolution does
     * not denote a screensharing connection has been successful and media is
     * flowing. Rejects with the rejection reason string if an error occurred
     * while starting the screensharing process, such as screenshare source
     * being cancelled.
     */
    startScreenshare(spotId, roomFullJId, screenshareConnection) {
        const { screensharing } = getInMeetingStatus(this._store.getState());

        if (screensharing) {
            logger.error('Tried to start screenshare while already started.');

            return Promise.reject();
        }

        this._screenshareConnection = screenshareConnection;

        this._store.dispatch(updateSpotState({
            isWirelessScreenshareConnectionActive: true
        }));

        return screenshareConnection.startScreenshare(
            spotId,
            roomFullJId
        ).catch(error => {
            logger.error('Could not establish screenshare connection:', error);

            screenshareConnection.stop();

            this._store.dispatch(updateSpotState({
                isWirelessScreenshareConnectionActive: false
            }));

            return Promise.reject(error);
        });
    }

    /**
     * Stops any active {@code ScreenshareConnection}.
     *
     * @returns {void}
     */
    stopScreenshare() {
        if (this._screenshareConnection) {
            this._screenshareConnection.stop();
            this._screenshareConnection = null;
        }

        this._store.dispatch(updateSpotState({
            isWirelessScreenshareConnectionActive: false
        }));
    }

    /**
     * A private helper to execute a given {@code JitsiMeetExternalAPI} only if
     * an instance of such exists.
     *
     * @param {string} command - The {@code JitsiMeetExternalAPI} command to be
     * executed.
     * @param {Object} data - Any additional information to pass to the
     * {@code JitsiMeetExternalAPI} instance.
     * @private
     * @returns {void}
     */
    _executeIfInMeeting(command, data) {
        const meetingApi = this._getMeetingApiIfInMeeting();

        if (!meetingApi) {
            logger.error('Failed to execute command.');

            return;
        }

        logger.log(
            `processUpdateDelegate executing command ${command}, ${data}`);

        meetingApi.executeCommand(command, data);
    }

    /**
     * Returns the instance of {@code JitsiMeetExternalApi} for an active
     * meeting.
     *
     * @private
     * @returns {JitsiMeetExternalApi|null}
     */
    _getMeetingApiIfInMeeting() {
        const state = this._store.getState();
        const meetingApi = getMeetingApi(state);

        if (!meetingApi) {
            return null;
        }

        const { inMeeting } = getInMeetingStatus(state);

        if (!inMeeting) {
            return null;
        }

        return meetingApi;
    }

    /**
     * Invokes the {@code sendProxyConnectionEvent} method on the
     * {@code JitsiMeetExternalApi} if it exists.
     *
     * @param {Object} event - The event to pass into the api.
     * @private
     * @returns {void}
     */
    _sendEventIfInMeeting(event) {
        const meetingApi = this._getMeetingApiIfInMeeting();

        if (!meetingApi) {
            logger.error('Failed to send proxy event.');

            return;
        }

        meetingApi.sendProxyConnectionEvent(event);
    }
}
