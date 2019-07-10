import { logger } from 'common/logger';

export const asyncActionRequestStates = {
    DONE: 'DONE',
    ERROR: 'ERROR',
    PENDING: 'PENDING'
};

/**
 * Encapsulates updating the known status of a command in flight to a Spot-TV
 * for a state change.
 *
 * @param {Function} dispatch - The Redux dispatch function to update the
 * current state of a request in flight.
 * @param {Function} request - The function which should be executed that
 * performs the async request. The function must return a promise.
 * @param {Function} requestType - The type of the request. Used to reference
 * the request in Redux.
 * @param {Function} expectedValue - What the expected result of the request
 * should be. Used for optimistic updating of the UI.
 * @private
 * @returns {Function<Promise>}
 */
export function createAsyncActionWithStates( // eslint-disable-line max-params
        dispatch,
        request,
        requestType,
        expectedValue) {
    const start = new Date().getTime();

    logger.log('ASYNC ACTION ', {
        requestType,
        expectedValue
    });
    dispatch(setRequestState(
        requestType,
        asyncActionRequestStates.PENDING,
        expectedValue
    ));

    return request()
        .then(result => {
            logger.log('ASYNC ACTION DONE', {
                requestType,
                expectedValue,
                time: new Date().getTime() - start
            });
            dispatch(setRequestState(
                requestType,
                asyncActionRequestStates.DONE,
                expectedValue
            ));

            return Promise.resolve(result);
        })
        .catch(error => {
            logger.log('ASYNC ACTION FAILED', {
                requestType,
                expectedValue,
                time: new Date().getTime() - start
            });
            logger.error('Encountered error with async request', {
                error,
                expectedValue,
                requestType
            });

            dispatch(setRequestState(requestType, asyncActionRequestStates.ERROR, expectedValue));

            return Promise.reject(error);
        });
}

/**
 * Updates the known request state of a command to a Spot-TV.
 *
 * @param {string} requestType - The type of the request to the Spot-TV.
 * @param {string} requestState - Whether the request is pending, completed, or
 * has ended with an error.
 * @param {*} expectedState - The desired state the command is trying to make
 * the Spot-TV change to.
 * @returns {Object}
 */
function setRequestState(requestType, requestState, expectedState) {
    return {
        type: requestType,
        requestState,
        expectedState
    };
}
