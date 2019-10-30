
import { BOOTSTRAP_COMPLETE } from 'common/app-state/bootstrap';
import { MiddlewareRegistry } from 'common/redux';

import nativeController from './native-controller';

/**
 * The redux middleware for the native-controller feature.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case BOOTSTRAP_COMPLETE:
        nativeController._sendSpotClientReady();
        break;
    }

    return result;
});
