import { BOOTSTRAP_STARTED } from 'common/app-state/bootstrap';
import { logger } from 'common/logger';
import { MiddlewareRegistry } from 'common/redux';

import { nativeController } from '../native-functions/native-controller';

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
        nativeController.addMessageListener('spot-electron-logs', logString => {
            logger.log(logString);
        });
        break;
    }

    return result;
});
