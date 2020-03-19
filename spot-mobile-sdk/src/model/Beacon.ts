/**
 * Model class representing a Beacon (a.k.a nearby device).
 */
export default class Beacon {
    /**
     * The 6 digit join code emitted by the beacon.
     */
    public joinCode: string;

    /**
     * The Spot device name retreived from backend, if applicable.
     */
    public name?: string;

    /**
     * The approximate proximity of the beacon.
     */
    public proximity: string;

    /**
     * Instantiates a new {@code Beacon} instance.
     *
     * @param {string} joinCode - The 6 digit join code emitted by the beacon.
     * @param {string} name - The Spot device name retreived from backend, if applicable.
     * @param {string} proximity - The approximate proximity of the beacon.
     */
    constructor(joinCode: string, name: string | undefined, proximity: string) {
        this.joinCode = joinCode;
        this.name = name;
        this.proximity = proximity;
    }
}
