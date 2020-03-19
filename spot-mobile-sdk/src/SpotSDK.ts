import EventEmitter from 'eventemitter3';

// We import the {@code SpotDeviceEventEmitter} using a more specific path, because it's not exported
// by an index file, as we don't want to expose this internal class from the SDK.
import SpotDeviceEventEmitter from './beacons/SpotDeviceEventEmitter';
import logger from './logger';
import { Config, WrappedEvent } from './model';

/**
 * Class to serve as the entry point for SDK-based operations.
 */
class SpotSDK extends EventEmitter {
    /**
     * Getter for the config properties of the SDK.
     */
    public get config(): Config {
        if (!this._config) {
            logger.info('Default config is used.');
            this._config = new Config();
        }

        return this._config;
    }

    /**
     * Config properties of the SDK.
     */
    private _config?: Config;

    /**
     * {@code SpotDeviceEventEmitter} instance to detect nearby devices.
     */
    public deviceEventEmitter: SpotDeviceEventEmitter;

    /**
     * Instantiates a new {@code SDK} instance.
     */
    public constructor() {
        super();

        this.eventForwarder = this.eventForwarder.bind(this);

        this.deviceEventEmitter = new SpotDeviceEventEmitter();
        this.deviceEventEmitter.addListener('deviceEvent', this.eventForwarder);
    }

    /**
     * Initializes the SDK.
     *
     * @param {Config} config - The config object to be set.
     * @return {void}
     */
    public initialize(config: Config): void {
        this._config = config;
    }

    /**
     * Function to start device detection.
     *
     * NOTE: This will be the first point where permissions will be asked.
     *
     * @returns {void}
     */
    public startDeviceDetection(): void {
        this.deviceEventEmitter.start(this.config);
    }

    /**
     * Function to stop device detection.
     *
     * @returns {void}
     */
    public stopDeviceDetection(): void {
        this.deviceEventEmitter.stop();
    }

    /**
     * A generic event forwarded to forward events bubbled up from sub components.
     *
     * @param {WrappedEvent} wrappedEvent - The wrapped event that we received from a sub component of the SDK.
     * @returns {void}
     */
    private eventForwarder(wrappedEvent: WrappedEvent): void {
        this.emit(wrappedEvent.eventName, wrappedEvent.eventParam);
    }
}

export default new SpotSDK();
