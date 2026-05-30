import { PostToEndpoint } from './PostToEndpoint';
import {
    SET_LOGGING_SERVICE
} from './action-types';
import logger from './logger';
import LoggingService from './logging-service';

/**
 * Initializes new logging service instance.
 *
 * @param deviceId - The device id which will identify this client.
 * @param loggingEndpoint - The URL pointing to an endpoint where logs will be posted.
 * @returns {Object}
 */
export function createLoggingService(deviceId: string, loggingEndpoint: string): any {
    const loggingService = new LoggingService();

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
