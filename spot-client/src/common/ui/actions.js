import { VIEW_DISPLAYED } from './actionTypes';

/**
 * Action dispatched when a {@code View} has been displayed.
 *
 * @param {string} name - The view's name.
 * @returns {Object}
 */
export function viewDisplayed(name) {
    return {
        type: VIEW_DISPLAYED,
        name
    };
}
