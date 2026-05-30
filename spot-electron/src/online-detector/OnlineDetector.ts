import isOnline from 'is-online';
import { EventEmitter } from 'node:events';

import logger from '../logger/logger.js';

/**
 * Encapsulates logic to check if there is an active network connection. When
 * the connectivity changes, emits an update.
 */
class OnlineDetector extends EventEmitter {
    static ONLINE_STATUS_CHANGED = 'online-status-changed';

    // Indirection so tests can stub the network check.
    static _isOnline: () => Promise<boolean> = isOnline;

    private _onlineCheckInterval: number;
    private _nextOnlineCheck: ReturnType<typeof setTimeout> | null;
    private _lastOnlineStatus: boolean;

    /**
     * Instantiates a new instance.
     *
     * @param onlineCheckInterval - The rate at which the network connectivity should be checked.
     */
    constructor(onlineCheckInterval = 10000) {
        super();

        this._onlineCheckInterval = onlineCheckInterval;
        this._nextOnlineCheck = null;

        // Assume network connection is online to start.
        this._lastOnlineStatus = true;
    }

    /**
     * Cleans up the instance, essentially resetting its state.
     *
     * @returns {void}
     */
    destroy(): void {
        this.pause();
        this.removeAllListeners();
    }

    /**
     * Returns the cached response from that last network connection check.
     *
     * @returns {boolean}
     */
    getLastOnlineStatus(): boolean {
        return this._lastOnlineStatus;
    }

    /**
     * Begins polling to check network connectivity.
     *
     * @returns {void}
     */
    start(): void {
        if (this._nextOnlineCheck) {
            return;
        }

        this._enqueueOnlineCheck();
    }

    /**
     * Stop polling to check network connectivity.
     *
     * @returns {void}
     */
    pause(): void {
        if (this._nextOnlineCheck) {
            clearTimeout(this._nextOnlineCheck);
        }

        this._nextOnlineCheck = null;
    }

    /**
     * After a timeout, performs the actual check for network connectivity.
     * Will recursively call itself to keep checking.
     *
     * @private
     * @returns {void}
     */
    private _enqueueOnlineCheck(): void {
        if (this._nextOnlineCheck) {
            return;
        }

        this._nextOnlineCheck = setTimeout(() => {
            OnlineDetector._isOnline()
                .then(onlineStatus => {
                    if (onlineStatus !== this._lastOnlineStatus) {
                        logger.info(`Network active status changed to: ${onlineStatus}`);

                        this._lastOnlineStatus = onlineStatus;

                        this.emit(OnlineDetector.ONLINE_STATUS_CHANGED, onlineStatus);
                    }

                    this._nextOnlineCheck = null;
                    this._enqueueOnlineCheck();
                });

        }, this._onlineCheckInterval);
    }
}

export default OnlineDetector;
