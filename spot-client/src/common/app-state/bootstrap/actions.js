import { BOOTSTRAP_COMPLETE } from './action-types';

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
