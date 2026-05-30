import type { ErrorInfo } from 'react';

import { ERROR_BOUNDARY_DISPLAYED } from './actionTypes';

/**
 * Dispatched when React error boundary  is triggered and when Spot client is to be reloaded.
 *
 * @param error - The uncaught {@code Error} that triggered the error boundary.
 * @param info - Any extra error info as defined by React's {@link ErrorInfo} type.
 * @returns
 */
export function errorBoundaryDisplayed(error: Error, info: ErrorInfo) {
    return {
        type: ERROR_BOUNDARY_DISPLAYED,
        error,
        info
    };
}
