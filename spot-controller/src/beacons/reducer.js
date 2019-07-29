import { ReducerRegistry } from 'jitsi-meet-redux';

import { NOTIFICATION_RECEIVED } from '../notifications';

import { RESET_BEACON_NOTIFICATION_FLAG, UPDATE_BEACONS, UPDATE_JOIN_READY } from './actionTypes';
import { BEACON_REGION } from './constants';
import { getIntegerUuid } from './functions';

const DEFAULT_STATE = {
    beacons: [],
    joinReady: false,
    notificationReceived: false
};

/**
 * Numeric representation of the region UUID.
 */
const UUID_NUMERIC = getIntegerUuid(BEACON_REGION.uuid);

ReducerRegistry.register('beacons', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case NOTIFICATION_RECEIVED:
        if (action.id === UUID_NUMERIC) {
            return {
                ...state,
                notificationReceived: true
            };
        }
        break;
    case RESET_BEACON_NOTIFICATION_FLAG:
        return {
            ...state,
            notificationReceived: false
        };

    case UPDATE_BEACONS:
        return {
            ...state,
            beacons: action.beacons
        };

    case UPDATE_JOIN_READY:
        return {
            ...state,
            joinReady: action.joinReady
        };
    }

    return state;
});
