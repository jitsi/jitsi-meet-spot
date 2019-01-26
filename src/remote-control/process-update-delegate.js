import { $iq } from 'strophe.js';
import { setCalendarEvents, setSpotLeft, updateSpotState } from 'actions';
import {
    getInMeetingStatus,
    getMeetingApi,
    getSpotId,
    isSpot
} from 'reducers';

import { logger } from 'utils';

import { COMMANDS } from './constants';

const presenceToStoreAsBoolean = new Set([
    'audioMuted',
    'inMeeting',
    'screensharing',
    'videoMuted'
]);

const presenceToStoreAsString = new Set([
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
     * @returns {Promise} Resolves with an ack as an iq.
     */
    onCommand(iq) {
        const from = iq.getAttribute('from');
        const command = iq.getElementsByTagName('command')[0];
        const commandType = command.getAttribute('type');
        const data = JSON.parse(command.textContent);
        const ack = $iq({ type: 'result',
            to: from,
            id: iq.getAttribute('id')
        });

        switch (commandType) {
        case COMMANDS.GO_TO_MEETING:
            this._history.push(`/meeting?location=${data.meetingName}`);
            break;

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
                meetingApi.executeCommand('submitFeedback', data);
            }

            break;
        }
        }

        return Promise.resolve(ack);
    }

    /**
     * Callback to invoke when Spot has a presence update so the app state
     * can be synced with Spot's current presence.
     *
     * @param {Object} presence - The presence update in XML format.
     * @returns {Promise}
     */
    onStatus(presence) {
        const localIsSpot = isSpot(this._store.getState());
        const updateType = presence.getAttribute('type');

        if (updateType === 'unavailable') {
            const from = presence.getAttribute('from');

            if (from === this.getSpotId()) {
                this._store.dispatch(setSpotLeft());
            }

            return Promise.resolve();
        }

        if (updateType === 'error') {
            if (!localIsSpot) {
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
            return Promise.resolve();
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

        this._store.dispatch(updateSpotState(newState));

        // For remote controls and for consistent implementation, update the
        // redux store through the calendar event flow that a Spot would use.
        if (status.calendar && !localIsSpot) {
            try {
                const events = JSON.parse(status.calendar);

                this._store.dispatch(setCalendarEvents(events));
            } catch (e) {
                logger.error('Error while parsing Spot calendar events:', e);
            }
        }

        return Promise.resolve();
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
        const state = this._store.getState();
        const meetingApi = getMeetingApi(state);

        if (!meetingApi) {
            logger.error('Tried to execute command without meeting api.');

            return;
        }

        const { inMeeting } = getInMeetingStatus(state);

        if (!inMeeting) {
            logger.error('Tried to execute command while not in a meeting.');

            return;
        }

        meetingApi.executeCommand(command, data);
    }
}
