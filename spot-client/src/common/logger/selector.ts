/**
 * Gets the logging service instance stored in the Redux store.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getLoggingService(state: any): any {
    return state.logger.loggingService;
}
