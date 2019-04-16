import { analytics, feedbackEvents } from 'common/analytics';
import { MiddlewareRegistry } from 'common/redux';
import { SUBMIT_FEEDBACK } from './../remote-control';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SUBMIT_FEEDBACK: {
        _submitFeedback(action);
        break;
    }
    }

    return result;
});

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
