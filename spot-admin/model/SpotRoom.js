/**
 * FIXME add JWT
 * @typedef {Object} SpotOptions
 * @property {string} roomName
 * @property {string} joinCode
 */

/**
 *
 */
class SpotRoom {
    /**
     *
     * @param {string} deviceId
     * @param {SpotOptions} options
     * @constructor
     */
    constructor(deviceId, options) {
        this.deviceId = deviceId;
        this.options = options;
    }

    toString() {
        return `SpotRoom[deviceId: ${this.deviceId} options:${JSON.stringify(this.options)}]`;
    }
}

module.exports = SpotRoom;
