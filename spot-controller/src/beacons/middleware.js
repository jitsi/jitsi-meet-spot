import { SpotSDK } from '@jitsi/spot-sdk';
import { MiddlewareRegistry } from 'jitsi-meet-redux';

import api from '../api';
import { APP_MOUNTED, APP_WILL_UNMOUNT } from '../app';
import { logger } from '../logger';
import { cancelLocalNotification, sendLocalNotification } from '../notifications';

import { updateBeacons, updateJoinReady } from './actions';
import { getIntegerUuid } from './functions';

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
 * Initiates the beacon functionality.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _initBeacons(store) {
    logger.info('Initializing beacons...');

    const { dispatch } = store;

    SpotSDK.initialize();

    SpotSDK.addListener('deviceDetected', device => {
        dispatch(updateBeacons(device));
    });

    SpotSDK.addListener('roomEntered', uuid => {
        dispatch(sendLocalNotification(
            getIntegerUuid(uuid),
            'Nearby TV Detected',
            'There is a nearby TV. Press the notification to connect.'));
    });

    SpotSDK.addListener('roomLeft', uuid => {
        dispatch(cancelLocalNotification(getIntegerUuid(uuid)));
    });

    SpotSDK.startDeviceDetection();
}

/**
 * Shuts down the beacon functionality.
 *
 * @returns {void}
 */
function _shutDownBeacons() {
    logger.info('Shutting down beacon scanning.');

    SpotSDK.stopDeviceDetection();
}

/**
 * Subscribe to the API event updates so then we know when to activate or deactivate the
 * beacons functionality.
 *
 * @param {Object} store - The Redux store.
 * @returns {void}
 */
function _subscribeToApiEvents(store) {
    api.once('joinCodeNeeded', () => {
        _initBeacons(store);
    });

    api.addListener('joinReady', state => {
        store.dispatch(updateJoinReady(state));
    });
}
