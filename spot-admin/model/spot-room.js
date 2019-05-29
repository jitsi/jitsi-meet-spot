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
     * @param {string} id - The Spot room ID.
     * @param {SpotOptions} options
     * @constructor
     */
    constructor(id, options) {
        this.id = id;
        this.options = options;
    }

    toString() {
        return `SpotRoom[id: ${this.id} options:${JSON.stringify(this.options)}]`;
    }
}

module.exports = SpotRoom;
