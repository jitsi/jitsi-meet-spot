const isOnline = require('is-online');
const EventEmitter = require('events');

/**
 * Encapsulates logic to check if there is an active network connection. When
 * the connectivity changes, emits an update.
 */
class OnlineDetector extends EventEmitter {
    /**
     * Instantiates a new instance.
     *
     * @param {number} onlineCheckInterval - The rate at which the network
     * connectivity should be checked.
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
    destroy() {
        this.pause();
        this.removeAllListeners();
    }

    /**
     * Returns the cached response from that last network connection check.
     *
     * @returns {boolean}
     */
    getLastOnlineStatus() {
        return this._lastOnlineStatus;
    }

    /**
     * Begins polling to check network connectivity.
     *
     * @returns {void}
     */
    start() {
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
    pause() {
        clearTimeout(this._nextOnlineCheck);

        this._nextOnlineCheck = null;
    }

    /**
     * After a timeout, performs the actual check for network connectivity.
     * Will recursively call itself to keep checking.
     *
     * @private s
     * @returns {void}
     */
    _enqueueOnlineCheck() {
        if (this._nextOnlineCheck) {
            return;
        }

        this._nextOnlineCheck = setTimeout(() => {
            OnlineDetector._isOnline()
                .then(onlineStatus => {
                    if (onlineStatus !== this._lastOnlineStatus) {
                        this._lastOnlineStatus = onlineStatus;

                        this.emit(OnlineDetector.ONLINE_STATUS_CHANGED, onlineStatus);
                    }

                    this._nextOnlineCheck = null;
                    this._enqueueOnlineCheck();
                });

        }, this._onlineCheckInterval);
    }
}

OnlineDetector._isOnline = isOnline;
OnlineDetector.ONLINE_STATUS_CHANGED = 'online-status-changed';

module.exports = OnlineDetector;
