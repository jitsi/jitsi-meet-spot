import EventEmitter from 'events';

import { logger } from '../logger';

type WebViewRef = { postMessage(message: string): void };

/**
 * A singleton class to control the spot remote site loaded in the vew view.
 */
class IFrameApi extends EventEmitter {
    private webViewRef?: WebViewRef;

    /**
     * Instructs the controller to enter the join code in the input field.
     *
     * NOTE: For UX purposes we reuse the existing join flow of the spot remote
     * to provide the same join flow (including errors) that the user experiences when
     * they enter a code normally.
     *
     * @param joinCode - The join code to enter.
     * @returns {void}
     */
    enterJoinCode(joinCode: string): void {
        this._sendMessage('connectWithCode', joinCode);
    }

    /**
     * Sets or updates the web view reference for this class.
     *
     * @param webViewRef - The reference to the web view that holds the loaded site.
     * @returns {void}
     */
    setReference(webViewRef: WebViewRef | null): void {
        this.webViewRef = webViewRef ?? undefined;
    }

    /**
     * Callback for the onMessage of the web view.
     *
     * @param data - The received message.
     * @returns {void}
     */
    _onMessage({ nativeEvent: { data } }: { nativeEvent: { data: string | Record<string, unknown> } }): void {
        try {
            const parsedMessage = typeof data === 'object' ? data : JSON.parse(data);

            // A Jitsi API message needs to have a messageType field, otherwise we ignore
            // handling it. Those messages may have arrived from other integrations, such as webpack.

            const { messageData, messageType } = parsedMessage;

            if (messageType) {
                api.emit(messageType, messageData);
            }
        } catch (error) {
            logger.warn(`Unknown message received: '${data}'`, error);
        }
    }

    /**
     * Sends a message to the loaded site.
     *
     * @param messageType - The type of the message to send.
     * @param messageData - The content of the message.
     * @returns {void}
     */
    _sendMessage(messageType: string, messageData: unknown): void {
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
