import { $iq } from 'strophe.js';
import { updateSpotState } from 'actions';
import { getCalendarEvents, getInMeetingStatus, getMeetingApi } from 'reducers';

import { COMMANDS } from './constants';

const presenceToStoreAsBoolean = new Set([
    'audioMuted',
    'screensharing',
    'videoMuted'
]);

const presenceToStoreAsString = new Set([
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

        let askResponseData = {};

        switch (commandType) {
        case COMMANDS.GO_TO_MEETING:
            this._history.push(`/meeting?location=${data.meetingName}`);
            break;

        case COMMANDS.HANG_UP:
            this._executeIfInMeeting('hangup');
            break;

        case COMMANDS.REQUEST_CALENDAR: {
            askResponseData = {
                events: getCalendarEvents(this._store.getState())
            };

            break;
        }

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

        case COMMANDS.SUBMIT_FEEDBACK:
            this._executeIfInMeeting('submitFeedback', data);
            break;
        }

        ack.c('data', { type: 'json' })
            .t(JSON.stringify(askResponseData))
            .up();

        return Promise.resolve(ack);
    }

    /**
     * Callback to invoke when Spot has a presence update so the app state
     * can be synced with Spot's current presence.
     *
     * @param {Object} update - The status update object.
     * @returns {Promise}
     */
    onStatus({ status }) {
        const newState = {};

        Object.keys(status).forEach(key => {
            if (presenceToStoreAsBoolean.has(key)) {
                newState[key] = status[key] === 'true';
            } else if (presenceToStoreAsString.has(key)) {
                newState[key] = status[key];
            }
        });

        this._store.dispatch(updateSpotState(newState));

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
        const meetingApi = getMeetingApi(this._store.getState());

        if (meetingApi) {
            meetingApi.executeCommand(command, data);
        }
    }
}
