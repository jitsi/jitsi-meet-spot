import { isElectron } from 'common/detection';
import { logger } from 'common/logger';

/**
 * Implements a controller that utilizes the event emitter of the main process if available.
 *
 * Using it will enable SpotTVs running wrapped in Electron or others access OS-native functions.
 */
class NativeController {
    /**
     * Instantiates a new instance of the controller.
     */
    constructor() {
        if (isElectron()) {
            // eslint-disable-next-line
            this.ipcRenderer = window.require('electron').ipcRenderer;
        } else {
            this.parentWindow = window.parent;
        }
    }

    /**
     * Adds a listener which will be notified when a new message arrives from the main process
     * over a specific channel identified by the given channel name string.
     *
     * @param {string} channelName - A channel name for which the listener will be notified.
     * @param {Function} listener - The listener instance which will get all the arguments passed by the sender when
     * sending a message on the named channel.
     * @returns {void}
     */
    addMessageListener(channelName, listener) {
        if (this.ipcRenderer) {
            this.ipcRenderer.on(channelName, (eventObject, ...args) => {
                listener(...args);
            });
        } else if (this.parentWindow) {
            window.addEventListener('message', evt => {
                if (evt.channelName === channelName) {
                    listener(evt.args);
                }
            });
        }
    }

    /**
     * Sends a message to the main process.
     *
     * @param {string} command - The command identifyer.
     * @param {Object} args - Args of the command, if any.
     * @returns {void}
     */
    sendMessage(command, args) {
        if (this.ipcRenderer) {
            this.ipcRenderer.send('native-command', {
                command,
                args
            });
        } else if (this.parentWindow) {
            this.parentWindow.postMessage({
                args,
                command
            }, '*');
        } else {
            logger.log(`Native functions are not available to do '${command}'`);
        }
    }

    /**
     * Pings main process letting know that the spot-client app has been initialized.
     *
     * @private
     * @returns {void}
     */
    _sendSpotClientReady() {
        this.sendMessage('clientReady');
    }
}

export default new NativeController();
