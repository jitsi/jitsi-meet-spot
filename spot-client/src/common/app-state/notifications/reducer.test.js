
import {
    NOTIFICATION_ADD,
    NOTIFICATION_REMOVE
} from './action-types';
import notifications from './reducer';

describe('reducer', () => {
    test('has empty notifications by default', () => {
        const newState = notifications(undefined, {});

        expect(newState.notifications).toEqual([]);
    });

    describe('adding notifications', () => {
        const addNotificationAction = {
            type: NOTIFICATION_ADD,
            notification: {
                id: 23,
                type: 'error',
                message: 'test error notification'
            }
        };

        test('can add a new notification', () => {
            const newState = notifications(
                { notifications: [] },
                addNotificationAction
            );

            expect(newState.notifications.length).toBe(1);
            expect(newState.notifications[0])
                .toEqual(addNotificationAction.notification);
        });

        test('does not mutate the passed-in state', () => {
            const testNotification = { id: 1 };
            const initialState = {
                notifications: [ testNotification ]
            };

            const newState = notifications(initialState, addNotificationAction);

            expect(Object.keys(initialState).length).toBe(1);
            expect(initialState.notifications).toEqual([ testNotification ]);

            expect(newState.notifications.length).toBe(2);
            expect(newState.notifications[0])
                .toEqual(initialState.notifications[0]);
            expect(newState.notifications[1])
                .toEqual(addNotificationAction.notification);
        });
    });

    describe('removing notifications', () => {
        const firstNotification = { id: 1 };
        const secondNotification = { id: 2 };
        const initialState = {
            notifications: [ firstNotification, secondNotification ]
        };
        const removeAction = {
            id: 1,
            type: NOTIFICATION_REMOVE
        };

        test('can remove a notification by id', () => {
            const newState = notifications(initialState, removeAction);

            expect(newState.notifications.length).toBe(1);
            expect(newState.notifications[0]).toEqual(secondNotification);
        });

        test('does not mutate the existing notifications', () => {
            notifications(initialState, removeAction);

            expect(initialState).toEqual({
                notifications: [ firstNotification, secondNotification ]
            });
        });
    });
});
