import { ReducerRegistry } from '../redux';

import { SET_LOGGING_SERVICE } from './action-types';

ReducerRegistry.register('logger', (state = { }, action) => {
    switch (action.type) {
    case SET_LOGGING_SERVICE:
        return {
            ...state,
            loggingService: action.loggingService
        };

    default:
        return state;
    }
});
