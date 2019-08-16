const ReconnectOverlay = require('../page-objects/reconnect-overlay');

const _OFFLINE_NETWORK_CONDITIONS = {
    offline: true,
    latency: 0,
    throughput: 0
};

/**
 * Base class for TV and Remote.
 */
class SpotUser {
    /**
     * Created new instance.
     *
     * @param {Client} driver - The automation driver for browser control.
     */
    constructor(driver) {
        this.driver = driver;

        this.reconnectOverlay = new ReconnectOverlay(this.driver);
    }

    /**
     * Gets the reconnect overlay.
     *
     * @returns {ReconnectOverlay}
     */
    getReconnectOverlay() {
        return this.reconnectOverlay;
    }

    /**
     * Simulates offline network conditions.
     *
     * @returns {void}
     */
    setNetworkOffline() {
        this.driver.setNetworkConditions(_OFFLINE_NETWORK_CONDITIONS);
    }

    /**
     * Restores network conditions to online.
     *
     * @returns {void}
     */
    setNetworkOnline() {
        this.driver.deleteNetworkConditions();
    }
}

module.exports = SpotUser;
