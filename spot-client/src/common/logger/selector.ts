import type { RootState } from 'common/app-state';
/**
 * Gets the logging service instance stored in the Redux store.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getLoggingService(state: RootState): any {
    return state.logger.loggingService;
}
