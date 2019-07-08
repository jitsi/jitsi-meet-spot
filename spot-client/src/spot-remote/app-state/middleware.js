import { MiddlewareRegistry } from 'common/redux';

import { API_MESSAGE_RECEIVED } from 'common/app-state';

import { setAPiReceivedJoinCode } from './actions';

MiddlewareRegistry.register(({ dispatch }) => next => action => {
    const result = next(action);

    switch (action.type) {
    case API_MESSAGE_RECEIVED:
        _handleApiMessage(action.messageType, action.message, dispatch);
        break;
    }

    return result;
});

/**
 * Handles an API message.
 *
 * @param {string} messageType - The message type.
 * @param {string|Object} message - The message.
 * @param {Dispatch} dispatch - The Redux dispatch function.
 * @returns {void}
 */
function _handleApiMessage(messageType, message, dispatch) {
    switch (messageType) {
    case 'connectWithCode':
        dispatch(setAPiReceivedJoinCode(message));
        break;
    }
}
