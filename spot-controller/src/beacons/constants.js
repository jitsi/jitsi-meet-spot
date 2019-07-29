/**
 * The Jitsi Meet region for beacons.
 */
export const BEACON_REGION = {
    identifier: '',
    uuid: 'bf23c311-24ae-414b-b153-cf097836947f'
};

/**
 * Closest proximity constant.
 */
export const PROXIMITY_IMMEDIATE = 'immediate';

/**
 * Second closest proximity constant.
 *
 * NOTE: We don't care about others for now.
 */
export const PROXIMITY_NEAR = 'near';

/**
 * The interval in ms to repeat scanning for beacons when the app is in the background.
 */
export const SCAN_INTERVAL = 5000;
