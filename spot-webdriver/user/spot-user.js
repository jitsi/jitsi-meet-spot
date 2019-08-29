const LoadingScreen = require('../page-objects/loading-screen');

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

        this.loadingScreen = new LoadingScreen(this.driver);
    }

    /**
     * Cleanups the session.
     *
     * @returns {void}
     */
    cleanup() {
        this.setNetworkOnline();
        this.disconnectRemoteControlService();
        this.clearStorage();
        this.stop();
    }

    /**
     * Clears the local storage.
     *
     * @returns {void}
     */
    clearStorage() {
        this.driver.executeAsync(done => {
            try {
                localStorage.clear();
                done();
            } catch (e) {
                done();
            }
        });
    }

    /**
     * Disconnects the remote control service.
     *
     * @returns {void}
     * @protected
     */
    disconnectRemoteControlService() {
        // Implemented in subclasses
    }

    /**
     * Gets the loading screen.
     *
     * @returns {LoadingScreen}
     */
    getLoadingScreen() {
        return this.loadingScreen;
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

    /**
     * Stops the Spot app by making the webdriver visit a blank page.
     *
     * @returns {void}
     */
    stop() {
        this.driver.url('about:blank');
    }
}

module.exports = SpotUser;
