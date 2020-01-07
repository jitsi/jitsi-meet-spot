const { ipcMain } = require('electron');
const EventEmitter = require('events');

const { logger } = require('../logger');

const EVENTS = require('./events');

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
            if (message.command === 'clientReady') {
                self._spotClientRef = event.sender;

                const clearReference = () => {
                    if (self._spotClientRef === event.sender) {
                        this._spotClientRef = undefined;
                        self.emit(EVENTS.CAN_SEND_MSG_EVENT, self.canSendClientMessage());
                    }
                };

                self._spotClientRef.once('crashed', clearReference);
                self._spotClientRef.once('destroyed', clearReference);

                self.emit(EVENTS.CAN_SEND_MSG_EVENT, self.canSendClientMessage());
            } else {
                self._handleClientMessage(event, message);
            }
        });
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

        logger.info(`Native command received: ${command}`, {
            command,
            args: JSON.stringify(args)
        });
        this.emit(command, args);
    }

    /**
     * Sends a message to spot-client JS counterpart. Check {@link canSendClientMessage}, before sending a message or
     * the operation may result in a no op.
     *
     * @param {string} channelName - The name of the channel on which the message will be sent.
     * @param {...*} args - Any arguments to be sent to the spot-client.
     * @returns {void}
     */
    sendClientMessage(channelName, ...args) {
        this._spotClientRef && this._spotClientRef.send(channelName, ...args);
    }

    /**
     * To be used be API consumer to check if the client controller is ready to send messages back to the spot-client.
     *
     * @returns {boolean}
     */
    canSendClientMessage() {
        return Boolean(this._spotClientRef);
    }
}

module.exports = new ClientController();
