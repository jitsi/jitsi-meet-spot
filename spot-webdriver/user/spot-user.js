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

        // Setting network conditions stops future traffic but does not kill
        // existing connections, so explicitly stop any active P2P connections.
        this.stopP2P();
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
        this.disconnectRemoteControlService();
        this.driver.url('about:blank');
    }

    /**
     * Stops any active peer-to-peer connections.
     *
     * @returns {void}
     */
    stopP2P() {
        // to be implemented
        this.driver.execute(rcsName => {
            window.spot[rcsName]._p2pSignaling.stop();
        }, this._internalRemoteControlServiceName);
    }

    /**
     * Waits for the peer-to-peer between a TV and remotes to be useable.
     *
     * @returns {void}
     */
    waitForP2PConnectionEstablished() {
        this.driver.waitUntil(
            () => this.driver.execute(rcsName => {
                // browser context - you may not access client or console
                try {
                    return window.spot[rcsName]._p2pSignaling.hasActiveConnection();
                } catch (e) {
                    return false;
                }
            }, this._internalRemoteControlServiceName),
            10000,
            `p2p not established with ${this._internalRemoteControlServiceName}`
        );
    }
}

module.exports = SpotUser;
