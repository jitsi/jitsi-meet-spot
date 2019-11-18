import { ReducerRegistry } from '../redux';
import {
    SET_IS_NIGHTLY_RELOAD_TIME,
    SET_OK_TO_UPDATE,
    SET_WEB_UPDATE_AVAILABLE
} from './actionTypes';

const DEFAULT_STATE = {
    isNightlyReloadTime: false,
    okToUpdate: false,
    webUpdateAvailable: false
};

ReducerRegistry.register('common/auto-update', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SET_IS_NIGHTLY_RELOAD_TIME:
        return {
            ...state,
            isNightlyReloadTime: action.isNightlyReloadTime
        };

    case SET_OK_TO_UPDATE:
        return {
            ...state,
            okToUpdate: action.okToUpdate
        };

    case SET_WEB_UPDATE_AVAILABLE:
        return {
            ...state,
            webUpdateAvailable: action.webUpdateAvailable
        };

    default:
        return state;
    }
});
