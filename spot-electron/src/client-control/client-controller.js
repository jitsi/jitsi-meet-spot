const { ipcMain } = require('electron');
const EventEmitter = require('events');

const { logger } = require('../logger');

/**
 * Implements a class that handles communication between the SpotTV web app running in the window and the
 * native elctron app.
 */
class ClientController extends EventEmitter {
    /**
     * Instantiates a new instance.
     */
    constructor() {
        super();

        // We need to explicitly store this reference, because the event emitter replaces it on invocation.
        const self = this;

        ipcMain.on('native-command', (event, message) => {
            self._handleClientMessage(event, message);
        });

        this.on('adjustVolume', console.log);
    }

    /**
     * Handles an incoming message (command) from the client and emits as an event.
     *
     * @param {Object} event - The event as the message originate.
     * @param {Object} message - The actual message.
     * @returns {void}
     */
    _handleClientMessage(event, message) {
        const { args, command } = message;

        logger.info(`Native command received: ${command} ${JSON.stringify(args)}`);
        this.emit(command, args);
    }
}

module.exports = new ClientController();
