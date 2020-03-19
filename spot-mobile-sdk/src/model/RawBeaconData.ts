/**
 * Model class representing the raw beacon data received from the native event emitter.
 */
export default class RawBeaconData {
    /**
     * The array of the beacons detected.
     */
    public beacons: Array<{

        /**
         * Two byte major version.
         */
        major: number;

        /**
         * Two byte minor version.
         */
        minor: number;

        /**
         * String representation of the proximity (immediate, near, far, unknown).
         */
        proximity: string;
    }> | undefined;
}
