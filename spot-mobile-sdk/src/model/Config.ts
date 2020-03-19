/**
 * Model class representing the configuration of the SDK.
 */
export default class Config {
    /**
     * The base URL to be used when connecting to the Spot instance (e.g. spot.jitsi.net).
     */
    public baseURL: string;

    /**
     * The beacon UUID to be used for ranging.
     */
    public beaconUUID: string;

    /**
     * The default device name to be shown when there is no available device name.
     */
    public defaultDeviceName: string;

    /**
     * Instantiates a new {@code Config} instance.
     *
     * @param {string} baseURL - The base URL to be used when connecting to the Spot instance (e.g. spot.jitsi.net).
     * @param {string} beaconUUID - The beacon UUID to be used for ranging.
     */
    constructor(config: {
        baseURL?: string;
        beaconUUID?: string;
        defaultDeviceName?: string;
    } = {}) {
        this.baseURL = config.baseURL || 'https://spot.jitsi.net/';
        this.beaconUUID = config.beaconUUID || 'bf23c311-24ae-414b-b153-cf097836947f';
        this.defaultDeviceName = config.defaultDeviceName || 'Unknown Spot device';
    }
}
