import {
    analytics,
    eventStatusSuffixes,
    feedbackEvents,
    inCallEvents,
    joinCodeEvents,
    meetingJoinEvents
} from 'common/analytics';
import {
    AUDIO_MUTE,
    DIAL_OUT,
    HANG_UP,
    JOIN_AD_HOC_MEETING,
    JOIN_SCHEDULED_MEETING,
    JOIN_WITH_SCREENSHARING,
    SCREENSHARE,
    TILE_VIEW,
    VIDEO_MUTE,
    requestStates
} from 'common/app-state';
import { asyncActionRequestStates } from 'common/async-actions';
import { MiddlewareRegistry } from 'common/redux';

import {
    SPOT_REMOTE_EXIT_SHARE_MODE,
    SPOT_REMOTE_JOIN_CODE_INVALID,
    SPOT_REMOTE_JOIN_CODE_VALID,
    SPOT_REMOTE_WILL_VALIDATE_JOIN_CODE
} from './../app-state';
import { SUBMIT_FEEDBACK } from './../remote-control';
import { shareModeEvents } from '../../common/analytics';

const requestStateToEventSuffix = {
    [requestStates.DONE]: eventStatusSuffixes.SUCCESS,
    [requestStates.ERROR]: eventStatusSuffixes.FAIL,
    [requestStates.PENDING]: eventStatusSuffixes.PENDING
};

/**
 * Attaches a request state suffix to the given event name.
 *
 * @param {string} eventName - The base event name.
 * @param {string} requestState - The current status of the async request.
 * @returns {string}
 */
function addRequestStateSuffix(eventName, requestState) {
    return `${eventName}${requestStateToEventSuffix[requestState] || ''}`;
}

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
        analytics.log(addRequestStateSuffix(
            meetingJoinEvents.AD_HOC,
            action.requestState
        ));
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
        analytics.log(addRequestStateSuffix(
            meetingJoinEvents.SCHEDULED_MEETING_JOIN,
            action.requestState
        ));
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
        let eventName;

        if (action.expectedState === 'proxy') {
            eventName = inCallEvents.WIRELESS_SCREENSHARE_START;
        } else if (action.expectedState === 'wired') {
            eventName = inCallEvents.WIRED_SCREENSHARE_START;
        } else if (action.expectedState === undefined) {
            eventName = inCallEvents.SCREENSHARE_STOP;
        }

        analytics.log(addRequestStateSuffix(
            eventName,
            action.requestState
        ));

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
    case TILE_VIEW: {
        if (isPendingAsyncAction(action)) {
            analytics.log(inCallEvents.TILE_VIEW_TOGGLE, { enabled: action.expectedState });
        }
        break;
    }
    case VIDEO_MUTE: {
        if (isPendingAsyncAction(action)) {
            analytics.log(inCallEvents.VIDEO_MUTE, { muting: action.expectedState });
        }
        break;
    }
    }

    return result;
});

/**
 * Checks if an async action update is notifying that a request is pending.
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
