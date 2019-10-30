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
}

export default new NativeController();
