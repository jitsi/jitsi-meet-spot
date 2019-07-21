import { combineReducers, createStore } from 'redux';

import * as actions from './actions';
import notificationsReducer from './reducer';
import * as selectors from './selectors';

describe('notifications state', () => {
    let dispatch, getState;

    beforeEach(() => {
        ({
            dispatch,
            getState
        } = createStore(combineReducers({ notifications: notificationsReducer })));
    });

    it('has empty notifications by default', () => {
        expect(selectors.getAllNotifications(getState())).toEqual([]);
    });

    it('saves new notifications', () => {
        const message = 'test-message';
        const type = 'test-type';

        dispatch(actions.addNotification(type, message));

        expect(selectors.getAllNotifications(getState())).toEqual([
            {
                id: expect.any(Number),
                message,
                type
            }
        ]);
    });

    it('removes notifications by id', () => {
        const secondMessage = 'second-message';
        const type = 'test-type';

        dispatch(actions.addNotification(type, 'first-message'));
        dispatch(actions.addNotification(type, secondMessage));

        const firstNotification = selectors.getAllNotifications(getState())[0];

        dispatch(actions.removeNotification(firstNotification.id));

        expect(selectors.getAllNotifications(getState())).toEqual([
            {
                id: expect.any(Number),
                message: secondMessage,
                type
            }
        ]);
    });
});
