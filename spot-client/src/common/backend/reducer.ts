import { ReducerRegistry } from '../../common/redux';

import {
    SET_PERMANENT_PAIRING_CODE
} from './actionTypes';

export interface IBackendState {
    permanentPairingCode?: string;
}

ReducerRegistry.register('backend', (state: IBackendState = { }, action: any) => {
    switch (action.type) {
    case SET_PERMANENT_PAIRING_CODE:
        return {
            ...state,
            permanentPairingCode: action.permanentPairingCode
        };

    default:
        return state;
    }
});
