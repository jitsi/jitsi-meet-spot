import { date } from 'common/date';

import { ReducerRegistry } from '../redux';
import {
    SET_IS_NIGHTLY_RELOAD_TIME,
    SET_LAST_LOAD_TIME,
    SET_OK_TO_UPDATE,
    SET_WEB_UPDATE_AVAILABLE
} from './actionTypes';

const DEFAULT_STATE = {
    isNightlyReloadTime: false,
    okToUpdate: false,
    webUpdateAvailable: false,
    _lastLoadTime: date.getCurrentDate()
};

ReducerRegistry.register('common/auto-update', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SET_IS_NIGHTLY_RELOAD_TIME:
        return {
            ...state,
            isNightlyReloadTime: action.isNightlyReloadTime
        };

    case SET_LAST_LOAD_TIME:
        return {
            ...state,
            _lastLoadTime: action._lastLoadTime
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
