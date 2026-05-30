jest.mock('../logger', () => ({
    logger: {
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
    }
}));

import api from './index';

describe('api (web <-> native message bridge)', () => {
    beforeEach(() => {
        api.removeAllListeners();
        api.setReference(null);
    });

    describe('enterJoinCode / _sendMessage', () => {
        it('posts a connectWithCode message to the web view', () => {
            const postMessage = jest.fn();

            api.setReference({ postMessage });
            api.enterJoinCode('abc123');

            expect(postMessage).toHaveBeenCalledWith(
                JSON.stringify({ messageType: 'connectWithCode', messageData: 'abc123' })
            );
        });

        it('is a no-op when no web view reference is set', () => {
            expect(() => api.enterJoinCode('abc123')).not.toThrow();
        });
    });

    describe('_onMessage', () => {
        it('emits the messageType with messageData for a JSON string payload', () => {
            const handler = jest.fn();

            api.on('myType', handler);
            api._onMessage({
                nativeEvent: { data: JSON.stringify({ messageType: 'myType', messageData: { x: 1 } }) }
            });

            expect(handler).toHaveBeenCalledWith({ x: 1 });
        });

        it('handles an already-parsed object payload', () => {
            const handler = jest.fn();

            api.on('objType', handler);
            api._onMessage({
                nativeEvent: { data: { messageType: 'objType', messageData: 'hi' } }
            });

            expect(handler).toHaveBeenCalledWith('hi');
        });

        it('does not emit when messageType is absent', () => {
            const handler = jest.fn();

            api.on('whatever', handler);
            api._onMessage({
                nativeEvent: { data: JSON.stringify({ messageData: 'nope' }) }
            });

            expect(handler).not.toHaveBeenCalled();
        });

        it('swallows invalid JSON without throwing', () => {
            expect(() => api._onMessage({ nativeEvent: { data: 'not-json{' } })).not.toThrow();
        });
    });
});
