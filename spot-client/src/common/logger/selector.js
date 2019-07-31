/**
 * Gets the logging service instance stored in the Redux store.
 *
 * @param {Object} state - The Redux state.
 * @returns {LoggingService}
 */
export function getLoggingService(state) {
    return state.logger.loggingService;
}
