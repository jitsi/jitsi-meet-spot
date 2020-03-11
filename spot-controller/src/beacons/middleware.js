import { MiddlewareRegistry } from 'jitsi-meet-redux';
import { PermissionsAndroid, Platform } from 'react-native';
import Beacons from 'react-native-beacons-manager';

import api from '../api';
import { APP_MOUNTED, APP_WILL_UNMOUNT } from '../app';
import { logger } from '../logger';
import { cancelLocalNotification, sendLocalNotification } from '../notifications';

import { updateBeacons, updateJoinReady } from './actions';
import { BEACON_REGION } from './constants';
import { getIntegerUuid, isEqual, parseBeaconJoinCode } from './functions';

// Auth statuses.
const AUTH_ALWAYS = 'authorizedAlways';
const AUTH_GRANTED = 'granted'; // Android
const AUTH_NOT_DETERMINED = 'notDetermined';
const AUTH_WHEN_IN_USE = 'authorizedWhenInUse';

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
    const result = next(action);

    switch (action.type) {
    case APP_MOUNTED:
        _subscribeToApiEvents(store);
        break;
    case APP_WILL_UNMOUNT:
        _shutDownBeacons();
        break;
    }

    return result;
});

/**
 * Callback to be invoked when we get an authorization update from the OS.
 *
 * @param {string} auth - The new auth status.
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _authUpdate(auth) {
    logger.info('Beacon detection authorization', auth);

    switch (auth) {
    case AUTH_ALWAYS:
    case AUTH_GRANTED:
        // We can do both monitoring and ranging.
        logger.info('Starting region monitoring and ranging.', auth);
        Beacons.startMonitoringForRegion(BEACON_REGION);
        Beacons.startRangingBeaconsInRegion(BEACON_REGION);
        break;
    case AUTH_WHEN_IN_USE:
        // We can only do ranging.
        logger.info('Starting region ranging.', auth);
        Beacons.startRangingBeaconsInRegion(BEACON_REGION);
        break;
    case AUTH_NOT_DETERMINED:
        logger.info('Beacon permission is not determined, asking for permission...');
        Beacons.requestAlwaysAuthorization();
        break;
    }
}

/**
 * Callback to handle the beaconsDidRange event.
 *
 * @param {Object} data - The raw beacon data.
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _beaconsDidRange(data, { dispatch, getState }) {
    const beacons = ((data && data.beacons) || []).map(beaconData => {
        return {
            joinCode: parseBeaconJoinCode(beaconData.major, beaconData.minor),
            proximity: beaconData.proximity
        };
    }).filter(beacon => beacon.proximity !== 'unknown');

    if (!isEqual(getState().beacons.beacons, beacons)) {
        dispatch(updateBeacons(beacons));
        logger.info('Beacon detected', beacons);
    }
}

/**
 * Initiates the beacon functionality.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _initBeacons(store) {
    logger.info('Initializing beacons...');

    // Removing listeners, if any
    Beacons.BeaconsEventEmitter.removeAllListeners('authorizationStatusDidChange');
    Beacons.BeaconsEventEmitter.removeAllListeners('beaconsDidRange');
    Beacons.BeaconsEventEmitter.removeAllListeners('regionDidEnter');
    Beacons.BeaconsEventEmitter.removeAllListeners('regionDidExit');

    // Setting up event listeners
    Beacons.BeaconsEventEmitter.addListener('authorizationStatusDidChange', auth => _authUpdate(auth, store));
    Beacons.BeaconsEventEmitter.addListener('beaconsDidRange', data => _beaconsDidRange(data, store));
    Beacons.BeaconsEventEmitter.addListener('regionDidEnter', data => _regionDidEnter(data, store));
    Beacons.BeaconsEventEmitter.addListener('regionDidExit', data => _regionDidExit(data, store));

    // Init permissions
    if (Platform.OS === 'ios') {
        Beacons.getAuthorizationStatus(auth => _authUpdate(auth, store));
    } else {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
        .then(auth => _authUpdate(auth, store));
    }
}

/**
 * Callback to handle the regionDidEnter event.
 *
 * @param {Object} data - The raw region data.
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _regionDidEnter(data, { dispatch }) {
    logger.info(`Beacon region entered: ${data.uuid}`);
    dispatch(sendLocalNotification(
        getIntegerUuid(data.uuid),
        'Nearby TV Detected',
        'There is a nearby TV. Press the notification to connect.'));
}

/**
 * Callback to handle the regionDidExit event.
 *
 * @param {Object} data - The raw region data.
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _regionDidExit(data, { dispatch }) {
    logger.info(`Beacon region exited: ${data.uuid}`);
    dispatch(cancelLocalNotification(data.uuid));
}

/**
 * Shuts down the beacon functionality.
 *
 * @returns {void}
 */
function _shutDownBeacons() {
    logger.info('Shutting down beacon scanning.');

    // We only shut down ranging, as monitoring should continue in the background and when the app is killed.
    Beacons.stopRangingBeaconsInRegion(BEACON_REGION);
}

/**
 * Subscribe to the API event updates so then we know when to activate or deactivate the
 * beacons functionality.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _subscribeToApiEvents(store) {
    api.addListener('joinCodeNeeded', () => {
        _initBeacons(store);
    });

    api.addListener('joinReady', state => {
        store.dispatch(updateJoinReady(state));
    });
}
