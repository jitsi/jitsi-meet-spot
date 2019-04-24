import { analytics, feedbackEvents, inCallEvents, joinCodeEvents, meetingJoinEvents } from 'common/analytics';
import {
    AUDIO_MUTE,
    DIAL_OUT,
    HANG_UP,
    JOIN_AD_HOC_MEETING,
    JOIN_SCHEDULED_MEETING,
    JOIN_WITH_SCREENSHARING,
    SCREENSHARE,
    VIDEO_MUTE
} from 'common/app-state';
import { MiddlewareRegistry, asyncActionRequestStates } from 'common/redux';

import {
    SPOT_REMOTE_EXIT_SHARE_MODE,
    SPOT_REMOTE_JOIN_CODE_INVALID,
    SPOT_REMOTE_JOIN_CODE_VALID,
    SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE
} from './../app-state';
import { SUBMIT_FEEDBACK } from './../remote-control';
import { shareModeEvents } from '../../common/analytics';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case AUDIO_MUTE: {
        if (isPendingAsyncAction(action)) {
            analytics.log(inCallEvents.AUDIO_MUTE, { muting: action.expectedState });
        }
        break;
    }
    case DIAL_OUT: {
        analytics.log(meetingJoinEvents.DIAL_OUT);
        break;
    }
    case JOIN_AD_HOC_MEETING: {
        analytics.log(meetingJoinEvents.AD_HOC);
        break;
    }
    case SPOT_REMOTE_EXIT_SHARE_MODE: {
        analytics.updateProperty('share-mode', false);
        analytics.log(shareModeEvents.EXIT_SHARE_MODE);
        break;
    }
    case SPOT_REMOTE_JOIN_CODE_INVALID: {
        analytics.log(joinCodeEvents.VALIDATE_FAIL, { shareMode: action.shareMode });
        break;
    }
    case SPOT_REMOTE_JOIN_CODE_VALID: {
        analytics.log(joinCodeEvents.VALIDATE_SUCCESS, { shareMode: action.shareMode });
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

    case SCREENSHARE: {
        if (isPendingAsyncAction(action)) {
            if (action.expectedState === 'proxy') {
                analytics.log(inCallEvents.WIRELESS_SCREENSHARE_START);
            } else if (action.expectedState === 'wired') {
                analytics.log(inCallEvents.WIRED_SCREENSHARE_START);
            } else if (action.expectedState === undefined) {
                analytics.log(inCallEvents.SCREENSHARE_STOP);
            }
        }

        break;
    }
    case SUBMIT_FEEDBACK: {
        _submitFeedback(action);
        break;
    }
    case SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE: {
        if (action.shareMode) {
            analytics.updateProperty('share-mode', true);
            analytics.log(shareModeEvents.ENTER_SHARE_MODE);
        }
        analytics.log(joinCodeEvents.SUBMIT, { shareMode: action.shareMode });
        break;
    }
    case VIDEO_MUTE: {
        if (isPendingAsyncAction(action)) {
            analytics.log(inCallEvents.VIDEO_MUTE, { muting: action.expectedState });
        }
    }
    }

    return result;
});

/**
 * Checks if an async action update is notifies that a request is pending.
 *
 * @param {Object} action - The Redux action.
 * @private
 * @returns {boolean}
 */
function isPendingAsyncAction(action) {
    return action.requestState === asyncActionRequestStates.PENDING;
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
