import { ReducerRegistry } from '../redux';

import { SET_LOGGING_SERVICE } from './action-types';

export interface ILoggerState {
    loggingService?: any;
}

ReducerRegistry.register('logger', (state: ILoggerState = { }, action: any) => {
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
