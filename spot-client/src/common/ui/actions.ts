import { VIEW_DISPLAYED } from './actionTypes';

/**
 * Action dispatched when a {@code View} has been displayed.
 *
 * @param name - The view's name.
 * @returns
 */
export function viewDisplayed(name: string): any {
    return {
        type: VIEW_DISPLAYED,
        name
    };
}
