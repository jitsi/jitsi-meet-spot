import { SPOT_ROOM_DISPLAY_NAME, analytics } from 'common/analytics';
import { CALENDAR_SET_ERROR, SET_DISPLAY_NAME } from 'common/app-state';
import { MiddlewareRegistry } from 'common/redux';

import {
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS
} from '../backend';

import { backendPairingEvents, calendarEvents } from './events';

MiddlewareRegistry.register(() => next => action => {
    switch (action.type) {
    case CALENDAR_SET_ERROR:
        analytics.log(calendarEvents.CALENDAR_ERROR, { error: action.error });
        break;
    case SET_DISPLAY_NAME:
        analytics.updateProperty(SPOT_ROOM_DISPLAY_NAME, action.displayName);
        break;
    case SPOT_TV_PAIR_TO_BACKEND_FAIL:
        analytics.log(backendPairingEvents.VALIDATE_FAIL);
        break;

    case SPOT_TV_PAIR_TO_BACKEND_PENDING:
        analytics.log(backendPairingEvents.SUBMIT);
        break;

    case SPOT_TV_PAIR_TO_BACKEND_SUCCESS:
        analytics.log(backendPairingEvents.VALIDATE_SUCCESS);
        break;
    }

    return next(action);
});
