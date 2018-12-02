import { windowHandler } from 'utils';

/**
 * A class for managing the remote control window.
 */
export default class RemoteControlWindowService {
    /**
     * Initializes a new {@code RemoteControlWindowService} instance.
     *
     * @param {Object} config
     * @param {Function} urlGenerator - A function to invoke when generating
     * the URL to the remote control.
     */
    constructor(config) {
        /**
         * The interval to check if the remote control window instance has
         * been closed. This interval instance variable is set on window open
         * and unset on window close.
         */
        this._closeCheckerInterval = null;

        this._remoteControlUrlGenerator = config.urlGenerator;

        /**
         * The reference to the popup window showing the remote control.
         */
        this._windowInstance = null;
    }

    /**
     * Generates the URL for the remote control instance.
     *
     * @returns {string}
     */
    getUrl(...args) {
        return this._remoteControlUrlGenerator(...args);
    }

    /**
     * Opens a window that allows remote control over the provided user id.
     *
     * @returns {void}
     * @private
     */
    open(targetId) {
        if (this._windowInstance) {
            this._windowInstance.focus();

            return;
        }

        this._windowInstance = windowHandler.openNewWindow(
            this.getUrl(targetId), 'spot-remote-control',
            {
                width: 400,
                height: 800
            }
        );

        this._startWindowCloseChecker();
    }

    /**
     * Triggers an interval to check if the popup window has been closed. An
     * interval is used for cross origin support, versus attaching handlers
     * directly to the window.
     *
     * @returns {void}
     * @private
     */
    _startWindowCloseChecker() {
        this._closeCheckerInterval = setInterval(() => {
            if (!this._windowInstance || this._windowInstance.closed) {
                clearInterval(this._closeCheckerInterval);
                this._windowInstance = null;
            }
        }, 1000);
    }
}
