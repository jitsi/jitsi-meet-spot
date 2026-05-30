import { API_MESSAGE_RECEIVED, SEND_API_MESSAGE } from './actionTypes';

/**
 * Action to signal that a new API message wasd received.
 *
 * @param messageType - Type of the message.
 * @param message - The message received.
 * @returns {{
 *     message: Object,
 *     messageType: string,
 *     type: API_MESSAGE_RECEIVED
 * }}
 */
export function apiMessageReceived(messageType: string, message: any): any {
    return {
        message,
        messageType,
        type: API_MESSAGE_RECEIVED
    };
}

/**
 * Action to send an API message.
 *
 * @param messageType - Type of the message.
 * @param messageData - The message metadata.
 * @returns {{
 *     messageData: *,
 *     messageType: string,
 *     type: SEND_API_MESSAGE
 * }}
 */
export function sendApiMessage(messageType: string, messageData: any): any {
    return {
        messageData,
        messageType,
        type: SEND_API_MESSAGE
    };
}
