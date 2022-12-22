const LoadingScreen = require('../page-objects/loading-screen');
const Notifications = require('../page-objects/notifications');
const constants = require('../constants');

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
     * @param {string} remoteControlServiceName - The name of the JS var for the RCS service(used when running scripts
     * on the browser).
     */
    constructor(driver, remoteControlServiceName) {
        this.driver = driver;

        /**
         * The name of the JS var for the RCS service(used when running scripts on the browser).
         *
         * @type {string}
         * @protected
         */
        this._remoteControlServiceName = remoteControlServiceName;

        this.loadingScreen = new LoadingScreen(this.driver);
        this.notifications = new Notifications(this.driver);
    }

    /**
     * Cleanups the session.
     *
     * @returns {void}
     */
    async cleanup() {
        await this.setNetworkOnline();
        await this.disconnectRemoteControlService();
        await this.clearStorage();
        await this.stop();
    }

    /**
     * Clears the local storage.
     *
     * @returns {void}
     */
    async clearStorage() {
        await browser[this.driver].executeAsync(done => {
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
    async disconnectRemoteControlService() {
        await browser[this.driver].executeAsync((rcsServiceName, done) => {
            try {
                window.spot[rcsServiceName].disconnect()
                    .then(done, done);
            } catch (e) {
                done();
            }
        }, this._remoteControlServiceName);
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
     * Returns an instance of {@code Notifications} which wraps interactions
     * with app notifications.
     *
     * @returns {Notifications}
     */
    getNotifications() {
        return this.notifications;
    }

    /**
     * Simulates offline network conditions.
     *
     * @returns {void}
     */
    async setNetworkOffline() {
        await browser[this.driver].setNetworkConditions(_OFFLINE_NETWORK_CONDITIONS);

        // It is expected that all services would drop the connection when internet goes offline,
        // but turns out that Websockets have to be killed, because somehow they avoid the link conditioner setting
        // once established. They will fail to reconnect while the network is offline though.
        await browser[this.driver].execute(rcsServiceName => {
            try {
                window.spot[rcsServiceName].xmppConnection.xmppConnection.xmpp.connection._proto.socket.close();
                // eslint-disable-next-line no-empty
            } catch (e) {

            }
        }, this._remoteControlServiceName);
    }

    /**
     * Restores network conditions to online.
     *
     * @returns {void}
     */
    async setNetworkOnline() {
        await browser[this.driver].setNetworkConditions({}, 'No throttling');
    }

    /**
     * Stops the Spot app by making the webdriver visit a blank page.
     *
     * @returns {void}
     */
    async stop() {
        await this.disconnectRemoteControlService();
        await browser[this.driver].url('about:blank');
    }

    /**
     * Stops any active peer-to-peer connections.
     *
     * @returns {void}
     */
    async stopP2PConnection() {
        await browser[this.driver].execute(rcsName => {
            try {
                window.spot[rcsName]._p2pSignaling.stop();
            } catch (e) {
                // Error means p2p is already destroyed.
            }
        }, this._remoteControlServiceName);
    }

    /**
     * Waits for the peer-to-peer between a TV and remotes to be useable.
     *
     * @returns {void}
     */
    async waitForP2PConnectionEstablished() {
        await browser[this.driver].waitUntil(
            async () => await browser[this.driver].execute(rcsName => {
                // browser context - you may not access client or console
                try {
                    return window.spot[rcsName]._p2pSignaling.hasActiveConnection();
                } catch (e) {
                    return false;
                }
            }, this._remoteControlServiceName), {
                timeout: constants.P2P_ESTABLISHED_WAIT,
                timeoutMsg: `p2p not established with ${this._remoteControlServiceName}`
            }
        );
    }

    /**
     * Polls for the XMPP connection to join the control MUC.
     *
     * @returns {void}
     */
    async waitForSignalingConnectionEstablished() {
        await browser[this.driver].waitUntil(
            async () => await browser[this.driver].execute(rcsName => {
                // browser context - you may not access client or console
                try {
                    const internalXmppConnection = window.spot[rcsName].xmppConnection;


                    return internalXmppConnection.isConnected()
                        && internalXmppConnection._hasJoinedMuc;
                } catch (e) {
                    return false;
                }
            }, this._remoteControlServiceName), {
                timeout: constants.MAX_PAGE_LOAD_WAIT,
                timeoutMsg: `signaling not established with ${this._remoteControlServiceName}`
            }
        );
    }

    /**
     * Checks for signaling to become disconnected.
     *
     * @returns {void}
     */
    async waitForSignalingConnectionStopped() {
        await browser[this.driver].waitUntil(
            async () => await browser[this.driver].execute(rcsName => {
                // browser context - you may not access client or console
                try {
                    return !window.spot[rcsName].xmppConnection.isConnected();
                } catch (e) {
                    return true;
                }
            }, this._remoteControlServiceName), {
                timeout: constants.SIGNALING_DISCONNECT_TIMEOUT,
                timeoutMsg: `signaling still connected with ${this._remoteControlServiceName}`
            }
            );
    }

}

module.exports = SpotUser;
