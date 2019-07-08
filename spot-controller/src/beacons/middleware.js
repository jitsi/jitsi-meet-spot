import { MiddlewareRegistry } from 'jitsi-meet-redux';
import { PermissionsAndroid } from 'react-native';
import Beacons from 'react-native-beacons-manager';

import api from '../api';
import { APP_MOUNTED, APP_WILL_UNMOUNT } from '../app';
import { logger } from '../logger';

import { updateBeacons, updateJoinReady } from './actions';
import { BEACON_IDENTIFIER, BEACON_REGION } from './constants';
import { isEqual, parseBeaconJoinCode } from './functions';

const AUTH_REQUIRED = 'authorizedWhenInUse';

/**
 * The redux middleware for the beacons feature.
 *
 * NOTE: Some platforms are not supported at the moment, so we just skip
 * registering the middelware in those cases.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    switch (action.type) {
    case APP_MOUNTED:
        _initBeacons(store);
        _subscribeToJoinReady(store);
        break;
    case APP_WILL_UNMOUNT:
        _shutDownBeacons();
        break;
    }

    return next(action);
});

/**
 * Initiates the beacon functionality.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _initBeacons(store) {
    Beacons.BeaconsEventEmitter.addListener('authorizationStatusDidChange', auth => {
        logger.info('Beacon detection authorization', auth);

        if (auth === AUTH_REQUIRED) {
            _startScanning(store);
        }
    });

    if (Beacons.getAuthorizationStatus) {
        // iOS flow is different
        Beacons.getAuthorizationStatus(auth => {
            logger.info('Beacon detection authorization', auth);

            if (auth === AUTH_REQUIRED) {
                _startScanning(store);
            } else {
                Beacons.requestWhenInUseAuthorization();
            }
        });
    } else {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then(auth => {
            if (auth === 'granted') {
                _startScanning(store);
            }
        });
    }
}

/**
 * Shuts down the beacon functionality.
 *
 * @returns {void}
 */
function _shutDownBeacons() {
    logger.info('Shutting down beacon scanning.');

    Beacons.stopRangingBeaconsInRegion({
        identifier: BEACON_IDENTIFIER,
        uuid: BEACON_REGION
    });
}

/**
 * Starts the beacon scanning.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _startScanning({ dispatch, getState }) {
    Beacons.BeaconsEventEmitter.addListener('beaconsDidRange', data => {
        const beacons = ((data && data.beacons) || []).map(beaconData => {
            return {
                joinCode: parseBeaconJoinCode(beaconData.major, beaconData.minor),
                proximity: beaconData.proximity
            };
        });

        if (!isEqual(getState().beacons.beacons, beacons)) {
            dispatch(updateBeacons(beacons));
            logger.info('Beacon detected', beacons);
        }
    });

    Beacons.startRangingBeaconsInRegion({
        identifier: BEACON_IDENTIFIER,
        uuid: BEACON_REGION
    });
}

/**
 * Subscribe to the join ready updates so then we know when to show the
 * beacon picker and try to initiate a connection.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _subscribeToJoinReady({ dispatch }) {
    api.addListener('joinReady', state => {
        dispatch(updateJoinReady(state));
    });
}
