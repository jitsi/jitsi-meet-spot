import logger from 'jitsi-meet-logger';

/**
 * An instantiated and configured {@code jitsi-meet-logger} instance.
 */
export default logger.getLogger('jitsi-meet-spot-sdk', undefined, {
    disableCallerInfo: true
});
