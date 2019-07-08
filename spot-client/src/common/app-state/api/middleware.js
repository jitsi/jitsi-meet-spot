import { MiddlewareRegistry } from 'common/redux';

import { logger } from '../../logger';

import { SEND_API_MESSAGE } from './actionTypes';

MiddlewareRegistry.register(() => next => action => {
    const result = next(action);

    switch (action.type) {
    case SEND_API_MESSAGE:
        _sendApiMessage(action.messageType, action.messageData);
        break;
    }

    return result;
});

/**
 * Sends an API message.
 *
 * @param {string} messageType - The message type.
 * @param {string|Object} messageData - The message.
 * @returns {void}
 */
function _sendApiMessage(messageType, messageData) {
    let target;

    // React native webview
    // eslint-disable-next-line prefer-const
    target = target || window.ReactNativeWebView;

    // Other (e.g. iFrame) implementations come here later
    // ...

    const apiMessage = JSON.stringify({
        messageData,
        messageType
    });

    if (target) {
        logger.log(`Sending API message ${apiMessage}`);

        target.postMessage(apiMessage);
    } else {
        logger.log(`Not sending API message ${apiMessage} (no consumer)`);
    }
}
