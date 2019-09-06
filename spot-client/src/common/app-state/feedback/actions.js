import {
    FEEDBACK_HIDE,
    FEEDBACK_SHOW,
    SUBMIT_FEEDBACK
} from './actionTypes';

/**
 * Signals app feedback entry not to be shown.
 *
 * @returns {Object}
 */
export function hideFeedback() {
    return {
        type: FEEDBACK_HIDE
    };
}

/**
 * Signals app feedback entry to be shown.
 *
 * @returns {Object}
 */
export function showFeedback() {
    return {
        type: FEEDBACK_SHOW
    };
}

/**
 * The action dispatched when user submits the feedback or if idle timeout occurs (timeout === true)
 * or if the user explicitly decides to not submit the feedback (skip === true and score === -1).
 *
 * @param {string} message - The feedback message as entered by the user.
 * @param {boolean} requestedMoreInfo - Whether the UI has explicitly asked user for more details
 * (which will be put into the message filed).
 * @param {number} score - The score/stars submitted by the user (from 1 to 5 and -1 no selection).
 * @param {boolean} timeout - Flag tells whether the action was triggered due to inactivity timeout
 * (the user left the feedback dialog open for too long without taking any action).
 * @returns {{
 *     type: SUBMIT_FEEDBACK,
 *     message: string,
 *     requestedMoreInfo: boolean,
 *     score: number,
 *     skip: boolean,
 *     timeout: boolean
 * }}
 */
export function submitFeedback({ message, requestedMoreInfo, score, timeout }) {
    return {
        type: SUBMIT_FEEDBACK,
        message,
        requestedMoreInfo,
        score,
        skip: score === -1 && !message,
        timeout
    };
}
