import { MiddlewareRegistry } from 'common/redux';

import { SPOT_TV_SET_FIXED_CODE_SEGMENT } from './action-types';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SPOT_TV_SET_FIXED_CODE_SEGMENT:
        // Reloading Spot TV when the fixed code segment changes.
        window.location.reload();
        break;
    }

    return result;
});
