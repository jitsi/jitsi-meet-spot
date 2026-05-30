/**
 * An analytics handler which can intercept and process log events.
 */
interface AnalyticsHandler {
    log(eventName: string, eventProperties?: any): void;
    page?(name: string, properties?: any): void;
    setId(newId: string): void;
    updateProperty(propertyName: string, propertyValue: any): void;
}

/**
 * Service for sending analytics events to an analytics endpoint.
 */
export class Analytics {
    _handlers: Set<AnalyticsHandler>;

    /**
     * Initializes a new {@code Analytics} instance.
     */
    constructor() {
        this._handlers = new Set();
    }

    /**
     * Sets a handler to intercept and process log events.
     *
     * @param handler - An analytics handler which can log events.
     * @returns {void}
     */
    addHandler(handler: AnalyticsHandler) {
        this._handlers.add(handler);
    }

    /**
     * Sends an event to be logged.
     *
     * @param eventName - A name which describes and identifies the
     * event to be logged.
     * @param eventProperties - Additional information to log which
     * describe the event in greater detail.
     * @returns {void}
     */
    log(eventName: string, eventProperties?: any) {
        this._handlers.forEach(handler =>
            handler.log(`spot-${eventName}`, eventProperties));
    }

    /**
     * Logs a page/view being displayed.
     *
     * @param name - A name which describes and identifies the page to be logged.
     * @param properties - Additional information to log which describe the page event in greater detail.
     * @returns {void}
     */
    page(name: string, properties?: any) {
        this._handlers.forEach(handler => {
            handler.page?.(name, properties);
        });
    }

    /**
     * Sets the new local analytics user id on all handlers.
     *
     * @param newId - The new unique id for the local user.
     * @returns {void}
     */
    updateId(newId: string) {
        this._handlers.forEach(handler => handler.setId(newId));
    }

    /**
     * Modifies the meta data to associate with the sender of events.
     *
     * @param propertyName - A key for a property to associate with
     * the current Spot instance sending events.
     * @param propertyValue - The value for the property.
     * @returns {void}
     */
    updateProperty(propertyName: string, propertyValue: any) {
        this._handlers.forEach(handler =>
            handler.updateProperty(propertyName, propertyValue));
    }
}

export default new Analytics();
