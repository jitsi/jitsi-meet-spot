import { Analytics } from './analytics';

describe('analytics', () => {
    let analytics, handler1, handler2;

    /**
     * Private helper to create an analytics handler with mock functions.
     *
     * @private
     * @returns {Handler}
     */
    function createMockHandler() {
        return {
            log: jest.fn(),
            setId: jest.fn(),
            updateProperty: jest.fn()
        };
    }

    beforeEach(() => {
        analytics = new Analytics();

        handler1 = createMockHandler();
        handler2 = createMockHandler();

        analytics.addHandler(handler1);
        analytics.addHandler(handler2);
    });

    it('logs events with all handlers', () => {
        const eventName = 'test-event';
        const eventProperties = { key: 'value' };
        const expectedEvent = 'spot-test-event';

        analytics.log(eventName, eventProperties);

        expect(handler1.log).toHaveBeenCalledWith(expectedEvent, eventProperties);
        expect(handler2.log).toHaveBeenCalledWith(expectedEvent, eventProperties);
    });

    it('updates handlers of new user id', () => {
        const newUserId = '123';

        analytics.updateId(newUserId);

        expect(handler1.setId).toHaveBeenCalledWith(newUserId);
        expect(handler2.setId).toHaveBeenCalledWith(newUserId);
    });

    it('updates handlers of new user attributes', () => {
        const newProperty = 'mock-property';
        const newValue = 'mock-value';

        analytics.updateProperty(newProperty, newValue);

        expect(handler1.updateProperty).toHaveBeenCalledWith(newProperty, newValue);
        expect(handler2.updateProperty).toHaveBeenCalledWith(newProperty, newValue);
    });
});
