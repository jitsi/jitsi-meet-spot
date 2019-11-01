import {
    SET_LOGGING_SERVICE
} from './action-types';
import logger from './logger';
import LoggingService from './logging-service';
import { PostToEndpoint } from './PostToEndpoint';

/**
 * Initializes new logging service instance.
 *
 * @param {string} deviceId - The device id which will identify this client.
 * @param {string} loggingEndpoint - The URL pointing to an endpoint where logs will be posted.
 * @returns {Object}
 */
export function createLoggingService(deviceId, loggingEndpoint) {
    const loggingService = new LoggingService(loggingEndpoint);

    loggingService.addHandler(
        new PostToEndpoint({
            deviceId,
            endpointUrl: loggingEndpoint
        })
    );

    loggingService.start();

    logger.log('Initialized logging service', { deviceId });

    return {
        type: SET_LOGGING_SERVICE,
        loggingService
    };
}
