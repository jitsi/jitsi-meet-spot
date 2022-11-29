import { BOOTSTRAP_STARTED } from 'common/app-state/bootstrap';
import { logger } from 'common/logger';
import { MiddlewareRegistry } from 'common/redux';

import { nativeController } from '../native-functions';

/**
 * The redux middleware for the electron logs tunnel.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_STARTED:
        // receive logs from main process in order to be displayed in web console.
        nativeController.addMessageListener('spot-electron-logs', (eventObject, level, message, context) => {
            const method = logger[level];
            const toFile = false;

            if (method) {
                // show log in console but skip save to log file as it was logged to file from main process.
                method(message, context, toFile);
            } else {
                logger.warn('Received logs with invalid level from electron logger', {
                    level,
                    message,
                    context
                }, toFile);
            }
        });
        break;
    }

    return result;
});
