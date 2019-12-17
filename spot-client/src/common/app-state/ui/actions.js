import { ERROR_BOUNDARY_DISPLAYED } from './actionTypes';

/**
 * Dispatched when React error boundary  is triggered and when Spot client is to be reloaded.
 *
 * @param {Error} error - The uncaught {@code Error} that triggered the error boundary.
 * @param {ErrorInfo} info - Any extra error info as defined by React's {@link ErrorInfo} type.
 * @returns {{
 *     type: ERROR_BOUNDARY_DISPLAYED,
 *     error: Error,
 *     info: ErrorInfo
 * }}
 */
export function errorBoundaryDisplayed(error, info) {
    return {
        type: ERROR_BOUNDARY_DISPLAYED,
        error,
        info
    };
}
