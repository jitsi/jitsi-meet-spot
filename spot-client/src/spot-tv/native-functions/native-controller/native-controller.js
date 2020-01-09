import { isElectron } from 'common/detection';
import { logger } from 'common/logger';

/**
 * Implements a controller that utilizes the event emitter of the native (Electron) process if available.
 *
 * Using it will enable SpotTVs running wrapped in Electron access OS-native functions.
 */
class NativeController {
    /**
     * Instantiates a new instance of the controller.
     */
    constructor() {
        // eslint-disable-next-line
        this.ipcRenderer = isElectron() && window.require('electron').ipcRenderer;
    }

    /**
     * Adds a listener which will be notified when a new message arrives from the main, native (Electron) process
     * over a specific channel identified by the given channel name string.
     *
     * @param {string} channelName - A channel name for which the listener will be notified.
     * @param {Function} listener - The listener instance which will get all the arguments passed by the sender when
     * sending a message on the named channel.
     * @returns {void}
     */
    addMessageListener(channelName, listener) {
        // Intentionally do not expose Electron's 'eventObject' - the reason is: there's no need at this point and
        // trying to think of NativeController as an abstraction layer.
        this.ipcRenderer && this.ipcRenderer.on(channelName, (eventObject, ...args) => {
            listener(...args);
        });
    }

    /**
     * Sends a message to the native process.
     *
     * @param {string} command - The command identifyer.
     * @param {Object} args - Args of the command, if any.
     * @returns {void}
     */
    sendMessage(command, args) {
        if (isElectron()) {
            this.ipcRenderer.send('native-command', {
                command,
                args
            });
        } else {
            logger.log(`Native functions are not available to do '${command}'`);
        }
    }

    /**
     * Pings Electron native process letting know that the spot-client app has been initialized.
     *
     * @private
     * @returns {void}
     */
    _sendSpotClientReady() {
        this.ipcRenderer && this.ipcRenderer.send('spot-client/ready', true);
    }
}

export default new NativeController();
