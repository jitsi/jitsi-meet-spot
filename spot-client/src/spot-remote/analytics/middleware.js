import { analytics, feedbackEvents, inCallEvents, meetingJoinEvents } from 'common/analytics';
import {
    DIAL_OUT,
    HANG_UP,
    JOIN_AD_HOC_MEETING,
    JOIN_SCHEDULED_MEETING,
    JOIN_WITH_SCREENSHARING,
    REMOTE_CONTROL_REQUEST_STATE,
    requestStates,
    requestTypes
} from 'common/app-state';
import { MiddlewareRegistry } from 'common/redux';
import { SUBMIT_FEEDBACK } from './../remote-control';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case DIAL_OUT: {
        analytics.log(meetingJoinEvents.DIAL_OUT);
        break;
    }
    case JOIN_AD_HOC_MEETING: {
        analytics.log(meetingJoinEvents.AD_HOC);
        break;
    }
    case JOIN_SCHEDULED_MEETING: {
        analytics.log(meetingJoinEvents.SCHEDULED_MEETING_JOIN);
        break;
    }
    case JOIN_WITH_SCREENSHARING: {
        analytics.log(
            action.screensharingType === 'wireless'
                ? meetingJoinEvents.WIRELESS_SCREENSHARE
                : meetingJoinEvents.WIRED_SCREENSHARE);
        break;
    }
    case HANG_UP: {
        analytics.log(inCallEvents.HANG_UP);
        break;
    }
    case REMOTE_CONTROL_REQUEST_STATE: {
        _remoteControlRequestState(action);
        break;
    }
    case SUBMIT_FEEDBACK: {
        _submitFeedback(action);
        break;
    }
    }

    return result;
});

/**
 * Tracks the {@link REMOTE_CONTROL_REQUEST_STATE} action and logs analytics when the PENDING state
 * is set (it corresponds to the user triggering an action).
 *
 * @param {string} requestType - The type of request like audio mute, video mute etc.
 * @param {string} requestState - The request state.
 * @param {any} expectedState - Depends on the request type.
 * @private
 * @returns {void}
 */
function _remoteControlRequestState({ requestType, requestState, expectedState }) {
    if (requestState !== requestStates.PENDING) {
        return;
    }

    switch (requestType) {
    case requestTypes.AUDIO_MUTE:
        analytics.log(inCallEvents.AUDIO_MUTE, { muting: expectedState });
        break;
    case requestTypes.VIDEO_MUTE:
        analytics.log(inCallEvents.VIDEO_MUTE, { muting: expectedState });
        break;
    }
}

/**
 * Sends analytics events for the {@link SUBMIT_FEEDBACK} action.
 *
 * @param {Object} action - The {@link SUBMIT_FEEDBACK} action.
 * @private
 * @returns {void}
 */
function _submitFeedback(action) {
    const {
        message,
        requestedMoreInfo,
        score,
        skip,
        timeout
    } = action;

    analytics.log(
        skip ? feedbackEvents.SKIP : feedbackEvents.SUBMIT, {
            message,
            requestedMoreInfo,
            score,
            timeout
        });
}
