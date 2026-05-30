import { API_MESSAGE_RECEIVED } from 'common/app-state';
import { MiddlewareRegistry } from 'common/redux';


import { setAPiReceivedJoinCode } from './actions';

MiddlewareRegistry.register(({ dispatch }: any) => (next: any) => (action: any) => {
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
 * @param messageType - The message type.
 * @param message - The message.
 * @param dispatch - The Redux dispatch function.
 * @returns {void}
 */
function _handleApiMessage(messageType: string, message: string | object, dispatch: any) {
    switch (messageType) {
    case 'connectWithCode':
        dispatch(setAPiReceivedJoinCode(message as string));
        break;
    }
}
