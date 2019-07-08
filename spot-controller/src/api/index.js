import EventEmitter from 'EventEmitter';

import { logger } from '../logger';

/**
 * A singleton class to control the spot remote site loaded in the vew view.
 */
class IFrameApi extends EventEmitter {
    /**
     * Instructs the controller to enter the join code in the input field.
     *
     * NOTE: For UX purposes we reuse the existing join flow of the spot remote
     * to provide the same join flow (including errors) that the user experiences when
     * they enter a code normally.
     *
     * @param {string} joinCode - The join code to enter.
     * @returns {void}
     */
    enterJoinCode(joinCode) {
        this._sendMessage('connectWithCode', joinCode);
    }

    /**
     * Sets or updates the web view reference for this class.
     *
     * @param {Object} webViewRef - The reference to the web view that holds the loaded site.
     * @returns {void}
     */
    setReference(webViewRef) {
        this.webViewRef = webViewRef;
    }

    /**
     * Callback for the onMessage of the web view.
     *
     * @param {Object} data - The received message.
     * @returns {void}
     */
    _onMessage({ nativeEvent: { data } }) {
        try {
            const parsedMessage = typeof data === 'object' ? data : JSON.parse(data);

            // A Jitsi API message needs to have a messageType field, otherwise we ignore
            // handling it. Those messages may have arrived from other integrations, such as webpack.

            const { messageData, messageType } = parsedMessage;

            // eslint-disable-next-line no-use-before-define
            messageType && api.emit(messageType, messageData);
        } catch (error) {
            logger.warn(`Unknown message received: '${data}'`, error);
        }
    }

    /**
     * Sends a message to the loaded site.
     *
     * @param {string} messageType - The type of the message to send.
     * @param {*} messageData - The content of the message.
     * @returns {void}
     */
    _sendMessage(messageType, messageData) {
        if (this.webViewRef) {
            this.webViewRef.postMessage(JSON.stringify({
                messageType,
                messageData
            }));
        }
    }
}

const api = new IFrameApi();

export default api;
