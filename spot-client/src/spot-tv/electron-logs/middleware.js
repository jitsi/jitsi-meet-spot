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
        nativeController.addMessageListener('spot-electron-logs', (eventObject, level, message, context) => {
            const method = logger[level];

            if (method) {
                method(message, context);
            } else {
                logger.warn('Received logs with invalid level from electron logger', {
                    level,
                    message,
                    context
                });
            }
        });
        break;
    }

    return result;
});
