import { SPOT_ROOM_DISPLAY_NAME, TENANT, analytics } from 'common/analytics';
import {
    CALENDAR_SET_ERROR,
    CALENDAR_SET_EVENTS,
    SET_DISPLAY_NAME,
    SET_TENANT,
    SPOT_TV_LEAVE_MEETING,
    isCalendarPushEnabled
} from 'common/app-state';
import { MiddlewareRegistry } from 'common/redux';

import { SPOT_TV_CONNECTION_FAILED, SPOT_TV_SET_MEETING_SUMMARY } from '../app-state';
import {
    SPOT_TV_PAIR_TO_BACKEND_FAIL,
    SPOT_TV_PAIR_TO_BACKEND_PENDING,
    SPOT_TV_PAIR_TO_BACKEND_SUCCESS
} from '../backend';

import MissedCalendarPushDetection from './MissedCalendarPushDetection';
import {
    backendPairingEvents,
    calendarEvents,
    connectionEvents,
    meetingEvents,
    meetingLeaveEvents
} from './events';

const missedCalendarPushDetection = new MissedCalendarPushDetection(analytics);

MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case CALENDAR_SET_ERROR: {
        const {
            error,
            isPolling
        } = action;

        analytics.log(calendarEvents.CALENDAR_ERROR, {
            error,
            isPolling
        });
        break;
    }
    case CALENDAR_SET_EVENTS: {
        const { events, isPolling } = action;
        const isPushEnabled = isCalendarPushEnabled(store.getState());

        missedCalendarPushDetection.onCalendarServiceUpdate(events, isPolling, isPushEnabled);
        break;
    }
    case SET_DISPLAY_NAME:
        analytics.updateProperty(SPOT_ROOM_DISPLAY_NAME, action.displayName);
        break;
    case SET_TENANT:
        analytics.updateProperty(TENANT, action.tenant);
        break;
    case SPOT_TV_CONNECTION_FAILED: {
        const {
            // eslint-disable-next-line no-unused-vars
            type,
            ...actionArgs
        } = action;

        analytics.log(connectionEvents.CONNECTION_FAILED, { ...actionArgs });
        break;
    }
    case SPOT_TV_LEAVE_MEETING:
        if (action.error) {
            analytics.log(meetingLeaveEvents.UNEXPECTED, { error: action.error });
        }
        break;
    case SPOT_TV_SET_MEETING_SUMMARY:
        analytics.log(meetingEvents.SUMMARY, action.meetingSummary);
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
