import { ReducerRegistry } from 'jitsi-meet-redux';

import { UPDATE_BEACONS, UPDATE_JOIN_READY } from './actionTypes';

const DEFAULT_STATE = {
    beacons: [],
    joinReady: false
};

ReducerRegistry.register('beacons', (state = DEFAULT_STATE, action) => {
    switch (action.type) {
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
