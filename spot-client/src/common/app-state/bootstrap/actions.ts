import { BOOTSTRAP_COMPLETE, BOOTSTRAP_STARTED } from './action-types';

/**
 * Marks the app as having loaded base dependencies and rendering ready to
 * occur.
 *
 * @returns {Object}
 */
export function setBootstrapComplete() {
    return {
        type: BOOTSTRAP_COMPLETE
    };
}

/**
 * The action is dispatched when the Redux store is up and running and the modules initialization
 * has been started.
 *
 * @returns {{
 *     type: BOOTSTRAP_STARTED
 * }}
 */
export function setBootstrapStarted() {
    return {
        type: BOOTSTRAP_STARTED
    };
}
