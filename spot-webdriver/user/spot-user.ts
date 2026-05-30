import * as constants from '../constants/index.js';
import type { BrowserName } from '../constants/index.js';
import { driverFor } from '../helpers/driver.js';
import LoadingScreen from '../page-objects/loading-screen.js';
import Notifications from '../page-objects/notifications.js';

const _OFFLINE_NETWORK_CONDITIONS = {
    offline: true,
    latency: 0,
    throughput: 0
};

/**
 * Base class for TV and Remote.
 */
class SpotUser {
    driver: BrowserName;
    loadingScreen: LoadingScreen;
    notifications: Notifications;

    /**
     * The name of the JS var for the RCS service (used when running scripts on the browser).
     *
     * @protected
     */
    protected _remoteControlServiceName: string;

    /**
     * Creates a new instance.
     *
     * @param driver - The capability name of the browser to control.
     * @param remoteControlServiceName - The name of the JS var for the RCS service.
     */
    constructor(driver: BrowserName, remoteControlServiceName: string) {
        this.driver = driver;
        this._remoteControlServiceName = remoteControlServiceName;

        this.loadingScreen = new LoadingScreen(this.driver);
        this.notifications = new Notifications(this.driver);
    }

    /**
     * The WebdriverIO browser instance for this user's capability.
     *
     * @returns {WebdriverIO.Browser}
     */
    protected get _browser(): WebdriverIO.Browser {
        return driverFor(this.driver);
    }

    /**
     * Cleans up the session.
     *
     * @returns {Promise<void>}
     */
    async cleanup(): Promise<void> {
        await this.setNetworkOnline();
        await this.disconnectRemoteControlService();
        await this.clearStorage();
        await this.stop();
    }

    /**
     * Clears the local storage.
     *
     * @returns {Promise<void>}
     */
    async clearStorage(): Promise<void> {
        await this._browser.execute(() => {
            try {
                localStorage.clear();
            } catch {
                // Ignore storage access errors.
            }
        });
    }

    /**
     * Disconnects the remote control service.
     *
     * @protected
     * @returns {Promise<void>}
     */
    async disconnectRemoteControlService(): Promise<void> {
        await this._browser.execute(async (rcsServiceName: string) => {
            try {
                await window.spot[rcsServiceName].disconnect();
            } catch {
                // Ignore - the service may already be disconnected.
            }
        }, this._remoteControlServiceName);
    }

    /**
     * Gets the loading screen.
     *
     * @returns {LoadingScreen}
     */
    getLoadingScreen(): LoadingScreen {
        return this.loadingScreen;
    }

    /**
     * Returns an instance of {@code Notifications} which wraps interactions with app notifications.
     *
     * @returns {Notifications}
     */
    getNotifications(): Notifications {
        return this.notifications;
    }

    /**
     * Simulates offline network conditions.
     *
     * @returns {Promise<void>}
     */
    async setNetworkOffline(): Promise<void> {
        await this._browser.setNetworkConditions(_OFFLINE_NETWORK_CONDITIONS);

        // It is expected that all services would drop the connection when internet goes offline,
        // but turns out that Websockets have to be killed, because somehow they avoid the link conditioner setting
        // once established. They will fail to reconnect while the network is offline though.
        await this._browser.execute(rcsServiceName => {
            try {
                window.spot[rcsServiceName].xmppConnection.xmppConnection.xmpp.connection._proto.socket.close();
            } catch {
                // Ignore.
            }
        }, this._remoteControlServiceName);
    }

    /**
     * Restores network conditions to online.
     *
     * @returns {Promise<void>}
     */
    async setNetworkOnline(): Promise<void> {
        await this._browser.setNetworkConditions({}, 'No throttling');
    }

    /**
     * Stops the Spot app by making the webdriver visit a blank page.
     *
     * @returns {Promise<void>}
     */
    async stop(): Promise<void> {
        await this.disconnectRemoteControlService();
        await this._browser.url('about:blank');
    }

    /**
     * Stops any active peer-to-peer connections.
     *
     * @returns {Promise<void>}
     */
    async stopP2PConnection(): Promise<void> {
        await this._browser.execute(rcsName => {
            try {
                window.spot[rcsName]._p2pSignaling.stop();
            } catch {
                // Error means p2p is already destroyed.
            }
        }, this._remoteControlServiceName);
    }

    /**
     * Waits for the peer-to-peer between a TV and remotes to be usable.
     *
     * @returns {Promise<void>}
     */
    async waitForP2PConnectionEstablished(): Promise<void> {
        await this._browser.waitUntil(
            () => this._browser.execute(rcsName => {
                // browser context - you may not access client or console
                try {
                    return window.spot[rcsName]._p2pSignaling.hasActiveConnection();
                } catch {
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
     * @returns {Promise<void>}
     */
    async waitForSignalingConnectionEstablished(): Promise<void> {
        await this._browser.waitUntil(
            () => this._browser.execute(rcsName => {
                // browser context - you may not access client or console
                try {
                    const internalXmppConnection = window.spot[rcsName].xmppConnection;


                    return internalXmppConnection.isConnected()
                        && internalXmppConnection._hasJoinedMuc;
                } catch {
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
     * @returns {Promise<void>}
     */
    async waitForSignalingConnectionStopped(): Promise<void> {
        await this._browser.waitUntil(
            () => this._browser.execute(rcsName => {
                // browser context - you may not access client or console
                try {
                    return !window.spot[rcsName].xmppConnection.isConnected();
                } catch {
                    return true;
                }
            }, this._remoteControlServiceName), {
                timeout: constants.SIGNALING_DISCONNECT_TIMEOUT,
                timeoutMsg: `signaling still connected with ${this._remoteControlServiceName}`
            }
        );
    }
}

export default SpotUser;
