import { logger } from 'common/logger';

import P2PSignalingBase from './P2PSignalingBase';
import XmppConnection from './xmpp-connection';

/**
 * A thing that once activated for specific remote address will try to make sure that there's active P2P connection and
 * will try to reconnect if the connection goes down.
 */
export default class P2PReconnectTrait {
    /**
     * The delay since the connection dropped to the next retry attempt.
     *
     * @type {number}
     */
    static RETRY_DELAY = 30000;

    /**
     * Initializes the new instance.
     *
     * @param {P2PSignalingBase} p2pSignaling - The P2P signaling class used to start new P2P connection.
     * @param {XmppConnection} xmppConnection - The signaling class used to track signaling availability. P2P can only
     * be established when the main signaling is online.
     */
    constructor(p2pSignaling, xmppConnection) {
        this._p2pSignaling = p2pSignaling;
        this._xmppConnection = xmppConnection;
        this._unregisterListeners = [];
    }

    /**
     * Activates the P2P reconnection logic for given remote address.
     *
     * @param {string} remoteAddress - Identifies the remote endpoint for P2P connection.
     * @param {number} [maxRetry] - How many retries will happen when the data channel goes down.
     * @returns {void}
     */
    activate(remoteAddress, maxRetry = 3) {
        this._retry = 0;
        this._maxRetry = maxRetry;
        this._remoteAddress = remoteAddress;

        this._unregisterListeners = [];
        this._unregisterListeners.push(
            this._p2pSignaling.addListener(
                P2PSignalingBase.DATA_CHANNEL_READY_UPDATE,
                this._onDataChannelReadyUpdate.bind(this)));
        this._unregisterListeners.push(
            this._xmppConnection.addListener(
                XmppConnection.CONNECTED_STATE_CHANGED,
                this._onSignalingConnectedUpdate.bind(this)));

        this._ensureP2PConnectionStarted();
    }

    /**
     * Cancels future retry if scheduled.
     *
     * @private
     * @returns {void}
     */
    _cancelRetry() {
        clearTimeout(this._retryTimeout);
        this._retryTimeout && logger.log(`Canceling P2P retry for: ${this._remoteAddress}`);
        this._retryTimeout = undefined;
    }

    /**
     * Deactivates the retry logic and cancels and scheduled retries.
     *
     * @returns {void}
     */
    deactivate() {
        for (const unregister of this._unregisterListeners) {
            unregister();
        }
        this._unregisterListeners = [];
        this._cancelRetry();
    }

    /**
     * Starts new P2P if there isn't any active one.
     *
     * @returns {boolean}
     * @private
     */
    _ensureP2PConnectionStarted() {
        if (!this._xmppConnection.isConnected()) {

            return false;
        }

        const connection = this._p2pSignaling.getConnectionForAddress(this._remoteAddress);

        if (connection && connection.isDataChannelActive()) {

            return false;
        } else if (connection && !connection.isDataChannelActive()) {
            this._p2pSignaling.closeConnection(this._remoteAddress);
        }

        logger.log(`Starting P2P Connection with ${this._remoteAddress}`);

        this._p2pSignaling.start(this._remoteAddress);

        return true;
    }

    /**
     * Triggered when P2P connection status changes.
     *
     * @param {string} remoteAddress - The remote address for the event target.
     * @param {boolean} isReady - Whether the data channel is now active or not.
     * @private
     * @returns {void}
     */
    _onDataChannelReadyUpdate(remoteAddress, isReady) {
        if (remoteAddress !== this._remoteAddress) {

            return;
        }

        if (isReady) {
            this._retry = 0;
        } else {
            if (!this._xmppConnection.isConnected()) {

                return;
            }
            if (this._retry >= this._maxRetry) {
                logger.log(`Giving up on P2P retries for ${this._remoteAddress}`);

                return;
            }

            this._cancelRetry();

            const retryDelay = P2PReconnectTrait.RETRY_DELAY;

            logger.log(`Will retry P2P connection in ${retryDelay}ms`);

            this._retryTimeout = setTimeout(() => {
                if (this._ensureP2PConnectionStarted()) {
                    this._retry += 1;
                }
                this._retryTimeout = undefined;
            }, retryDelay);
        }
    }

    /**
     * Triggered whe signaling goes offline/online.
     *
     * @param {boolean} isConnected - The new signaling status.
     * @returns {void}
     */
    _onSignalingConnectedUpdate(isConnected) {
        isConnected && this._ensureP2PConnectionStarted();
    }
}
