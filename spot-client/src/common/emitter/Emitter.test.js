import Emitter from './Emitter';

describe('Emitter', () => {
    const TEST_EVENT_1 = 'test-event-1';
    const TEST_EVENT_2 = 'test-event-2';

    let emitter;

    beforeEach(() => {
        emitter = new Emitter();
    });

    describe('addListener', () => {
        let mockCallback;

        beforeEach(() => {
            mockCallback = jest.fn();
        });

        test('subscribes a callback which will be notified', () => {
            emitter.addListener(TEST_EVENT_1, mockCallback);
            emitter.emit(TEST_EVENT_1);

            expect(mockCallback).toHaveBeenCalled();
        });

        test('returns an unsubscribe function', () => {
            const unsubscribe = emitter.addListener(TEST_EVENT_1, mockCallback);

            emitter.emit(TEST_EVENT_1);

            expect(mockCallback).toHaveBeenCalled();

            unsubscribe();

            emitter.emit(TEST_EVENT_1);

            expect(mockCallback.mock.calls.length).toBe(1);
        });

        test('subscribers the same callback only once', () => {
            for (let i = 0; i < 3; i++) {
                emitter.addListener(TEST_EVENT_1, mockCallback);
            }

            emitter.emit(TEST_EVENT_1);

            expect(mockCallback.mock.calls.length).toBe(1);
        });
    });

    describe('listenerCount', () => {
        test('returns the total number of subscribers to an event', () => {
            const testEvent1Count = 3;
            const testEvent2Count = 1;

            for (let i = 0; i < testEvent1Count; i++) {
                const mockCallback = jest.fn();

                emitter.addListener(TEST_EVENT_1, mockCallback);
            }

            for (let j = 0; j < testEvent2Count; j++) {
                const mockCallback = jest.fn();

                emitter.addListener(TEST_EVENT_2, mockCallback);
            }

            expect(emitter.listenerCount(TEST_EVENT_1)).toBe(testEvent1Count);
            expect(emitter.listenerCount(TEST_EVENT_2)).toBe(testEvent2Count);
        });
    });

    describe('removeAllListeners', () => {
        test('unsubscribes all listeners from all events', () => {
            const testEvent1Callback = jest.fn();
            const testEvent2Callback = jest.fn();

            emitter.addListener(TEST_EVENT_1, testEvent1Callback);
            emitter.addListener(TEST_EVENT_2, testEvent2Callback);

            emitter.removeAllListeners();

            emitter.emit(TEST_EVENT_1);
            emitter.emit(TEST_EVENT_2);

            expect(emitter.listenerCount(TEST_EVENT_1)).toBe(0);
            expect(emitter.listenerCount(TEST_EVENT_2)).toBe(0);

            expect(testEvent1Callback).not.toHaveBeenCalled();
            expect(testEvent2Callback).not.toHaveBeenCalled();
        });
    });

    describe('removeListener', () => {
        test('removes a specified listener from an event', () => {
            const testEvent1Callback = jest.fn();

            emitter.addListener(TEST_EVENT_1, testEvent1Callback);

            emitter.emit(TEST_EVENT_1);

            emitter.removeListener(TEST_EVENT_1, testEvent1Callback);

            emitter.emit(TEST_EVENT_1);

            expect(testEvent1Callback.mock.calls.length).toBe(1);
        });
    });
});
