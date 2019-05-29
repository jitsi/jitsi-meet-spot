import { SPOT_TV_SET_JOIN_CODE } from 'common/app-state';
import { MiddlewareRegistry } from 'common/redux';

import { nativeController } from '../native-controller';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SPOT_TV_SET_JOIN_CODE:
        nativeController.sendMessage('updateJoinCode', {
            joinCode: action.joinCode
        });
        break;
    }

    return result;
});
