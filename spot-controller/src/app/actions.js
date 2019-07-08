import {
    APP_MOUNTED,
    APP_WILL_UNMOUNT
} from './actionTypes';

/**
 * Action to signal that the app has successfully mounted.
 *
 * @returns {{
 *     type: APP_MOUNTED
 * }}
 */
export function appMounted() {
    return {
        type: APP_MOUNTED
    };
}

/**
 * Action to signal that the app will be unmounted.
 *
 * @returns {{
 *     type: APP_WILL_UNMOUNT
 * }}
 */
export function appWillUnmount() {
    return {
        type: APP_WILL_UNMOUNT
    };
}
