import EventEmitter from 'eventemitter3';
import { PermissionsAndroid, Platform } from 'react-native';
import Beacons from 'react-native-beacons-manager';

import {
    AUTH_ALWAYS,
    AUTH_GRANTED,
    AUTH_NOT_DETERMINED,
    AUTH_WHEN_IN_USE,
    DEVICE_DETECTED_EVENT,
    ROOM_ENTERED_EVENT,
    ROOM_LEFT_EVENT
} from './constants';

import logger from '../logger';
import { Beacon, Config, RawBeaconData, RawRegionData, WrappedEvent } from '../model';
import Utils from '../utils';

// WORKAROUND: Type defs are not up-to-date in the react-native-beacons-manager package
// eslint-disable-next-line dot-notation
const BeaconsEventEmitter = (Beacons || {})['BeaconsEventEmitter'];

/**
 * An event emitter instance to emit nearby devices related events.
 *
 * NOTE: Beacons functionality may not be enabled in certain consuming application, so we need
 * to handle the case when the Beacons (and all related) references are undefined.
 */
export default class SpotDeviceEventEmitter extends EventEmitter {
    public auth: string | undefined;
    public devicesNearby: Beacon[];

    /**
     * The config to use for the emitter.
     */
    private config: Config | undefined;

    /**
     * The region to listen for.
     */
    private region: {
        identifier: string;
        uuid: string;
    };

    /**
     * Instantiates a new {@code SpotDeviceEventEmitter} instance.
     *
     * @inheritdoc
     */
    constructor() {
        super();

        this.devicesNearby = [];
        this.region = {
            identifier: '',
            uuid: ''
        };

        this.authUpdate = this.authUpdate.bind(this);
        this.beaconsDidRange = this.beaconsDidRange.bind(this);
        this.regionDidEnter = this.regionDidEnter.bind(this);
        this.regionDidExit = this.regionDidExit.bind(this);

        // Setting up event listeners
        if (BeaconsEventEmitter) {
            BeaconsEventEmitter.addListener('authorizationStatusDidChange', (auth: string) => this.authUpdate(auth));
            BeaconsEventEmitter.addListener('beaconsDidRange', (data: RawBeaconData) => this.beaconsDidRange(data));
            BeaconsEventEmitter.addListener('regionDidEnter', (data: RawRegionData) => this.regionDidEnter(data));
            BeaconsEventEmitter.addListener('regionDidExit', (data: RawRegionData) => this.regionDidExit(data));
        }
    }

    /**
     * Starts the scanning for nearby devices.
     *
     * @param {Config} config - The config to use.
     * @returns {void}
     */
    public start(config: Config): void {
        this.config = config;
        this.region.uuid = config.beaconUUID;

        if (Beacons) {
            // Init permissions
            if (Platform.OS === 'ios') {
                Beacons.getAuthorizationStatus((auth: string) => this.authUpdate(auth));
            } else {
                PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)
                    .then((auth: string) => this.authUpdate(auth));
            }
        }
    }

    /**
     * Stops scanning for nearby devices.
     *
     * @returns {void}
     */
    public stop(): void {
        logger.info('Shutting down beacon scanning.');

        // We only shut down ranging, as monitoring should continue in the background and when the app is killed.
        Beacons && Beacons.stopRangingBeaconsInRegion(this.region);
    }

    /**
     * Callback to be invoked when we get an authorization update from the OS.
     *
     * @param {string} auth - The new auth status.
     * @returns {void}
     */
    private authUpdate(auth: string): void {
        if (!Beacons) {
            return;
        }

        logger.info('Beacon detection authorization', auth);

        if (this.auth !== auth) {
            this.auth = auth;
            switch (auth) {
            case AUTH_ALWAYS:
            case AUTH_GRANTED:
                // We can do both monitoring and ranging.
                logger.info('Starting region monitoring and ranging.', auth);
                Beacons.startMonitoringForRegion(this.region);
                Beacons.startRangingBeaconsInRegion(this.region);
                break;
            case AUTH_WHEN_IN_USE:
                // We can only do ranging.
                logger.info('Starting region ranging.', auth);
                Beacons.startRangingBeaconsInRegion(this.region);
                break;
            case AUTH_NOT_DETERMINED:
                logger.info('Beacon permission is not determined, asking for permission...');
                Beacons.requestAlwaysAuthorization();
                break;
            }
        }
    }

    /**
     * Callback to handle the beaconsDidRange event.
     *
     * @param {Array<RawBeaconData> | undefined} data - The raw beacon data.
     * @returns {void}
     */
    private beaconsDidRange(data: RawBeaconData): void {
        const beacons = ((data && data.beacons) || []).map(beaconData => new Beacon(
                Utils.parseBeaconJoinCode(beaconData.major, beaconData.minor),
                (this.config || {}).defaultDeviceName,
                beaconData.proximity
        )).filter(beacon => beacon.proximity !== 'unknown');

        if (!Utils.isEqual(this.devicesNearby, beacons)) {
            this.bubbleUp(new WrappedEvent(DEVICE_DETECTED_EVENT, beacons));
            logger.info('Beacon detected', beacons);
            this.devicesNearby = beacons;
        }
    }

    /**
     * Sends (bubbles up) an event to the top level SDK object to be available through the API.
     *
     * @param {WrappedEvent} event - The wrapped even tto bubble up.
     * @returns {void}
     */
    private bubbleUp(event: WrappedEvent): void {
        this.emit('deviceEvent', event);
    }

    /**
     * Callback to handle the regionDidEnter event.
     *
     * @param {RawRegionData} data - The raw region data.
     * @returns {void}
     */
    private regionDidEnter(data: RawRegionData): void {
        logger.info(`Beacon region entered: ${data.uuid}`);
        this.bubbleUp(new WrappedEvent(ROOM_ENTERED_EVENT, data.uuid));
    }

    /**
     * Callback to handle the regionDidExit event.
     *
     * @param {RawRegionData} data - The raw region data.
     * @returns {void}
     */
    private regionDidExit(data: RawRegionData): void {
        logger.info(`Beacon region exited: ${data.uuid}`);
        this.bubbleUp(new WrappedEvent(ROOM_LEFT_EVENT, data.uuid));
    }
}
