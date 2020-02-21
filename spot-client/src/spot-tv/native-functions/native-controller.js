import { isElectron } from 'common/detection';
import { Emitter } from 'common/emitter';
import { logger } from 'common/logger';

/**
 * Implements a controller that utilizes the event emitter of the native (Electron) process if available.
 *
 * Using it will enable SpotTVs running wrapped in Electron access OS-native functions.
 */
class NativeController extends Emitter {
    /**
     * Instantiates a new instance of the controller.
     */
    constructor() {
        super();

        // eslint-disable-next-linee
        if (isElectron()) {
            this.ipcRenderer = window.require('electron').ipcRenderer;
            logger.info('Native controller functionality is enabled via Electron.');
        } else {
            this.messageTransport = window;
            logger.info('Native controller functionality is enabled via iFrame.');
        }

        // message transports (such as 'window') handles the messages differently, so we need to subscribe
        // for messages here, and forward the channel message as an event once filtered.
        if (this.messageTransport) {
            this.messageTransport.addEventListener('message', evt => {
                // First check, if we got allocated a new tranport port
                if (evt.ports.length) {
                    this.messageSender = evt.ports[0];

                    logger.info('New transport port allocated for native controller.');
                }

                // Then go on to see if we got an actual message
                let channelMessage;

                try {
                    channelMessage = JSON.parse(evt.data);
                } catch (error) {
                    // Nothing to do here (messages just come and go over this channel,
                    // we don't want to log every error).
                    return;
                }

                const { channelName, ...rest } = channelMessage;

                if (channelName) {
                    logger.info(`Received message over channel ${channelName}: ${JSON.stringify(rest)}`);
                    this.emit(channelName, rest);
                }
            });
        }
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
        if (this.ipcRenderer) {
            this.ipcRenderer.on(channelName, listener);
        } else if (this.messageTransport) {
            this.addListener(channelName, listener);
        }
    }

    /**
     * Removes the listener for a given channel name.
     *
     * @param {string} channelName - The channel name we want to remove the listener for.
     * @param {Function} listener - The listener to remove.
     * @returns {void}
     */
    removeMessageListener(channelName, listener) {
        if (this.ipcRenderer) {
            this.ipcRenderer.removeListener(channelName, listener);
        } else if (this.messageTransport) {
            this.removeListener(channelName, listener);
        }
    }

    /**
     * Sends a message to the native process.
     *
     * @param {string} command - The command identifyer.
     * @param {Object} args - Args of the command, if any.
     * @returns {void}
     */
    sendMessage(command, args) {
        const commandObject = {
            command,
            args
        };

        logger.info(`Sending native command ${JSON.stringify(commandObject)}`);

        if (this.ipcRenderer) {
            this.ipcRenderer.send('native-command', commandObject);
        } else if (this.messageSender) {
            this.messageSender.postMessage(JSON.stringify(commandObject));
        } else if (this.messageTransport) {
            (this.messageTransport.parent || this.messageTransport)
                .postMessage(JSON.stringify(commandObject), '*');
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
