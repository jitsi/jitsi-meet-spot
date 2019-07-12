import { MiddlewareRegistry } from 'common/redux';
import { SET_ROOM_ID } from 'common/app-state';

import analytics from './analytics';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SET_ROOM_ID:
        analytics.updateId(action.id);

        break;
    }

    return result;
});
