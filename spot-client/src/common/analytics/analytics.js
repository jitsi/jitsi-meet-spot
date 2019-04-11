import AmplitudeHandler from './amplitude';

/**
 * Service for sending analytics events to an analytics endpoint.
 */
export default {
    /**
     * Create the handler for analytics events.
     *
     * @param {Object} options - The properties needed to initialize the
     * analytics handler.
     * @param {string} options.deviceId - The unique identifier for the current
     * user.
     * @param {string} options.appKey - The key needed to log analytics events
     * to a specified endpoint.
     * @returns {void}
     */
    init(options) {
        this.handler = new AmplitudeHandler(options.deviceId, options.appKey);
    },

    /**
     * Sends an event to be logged.
     *
     * @param {string} eventName - A name which describes and identifies the
     * event to be logged.
     * @param {Object} eventProperties - Additional information to log which
     * describe the event in greater detail.
     * @returns {void}
     */
    log(eventName, eventProperties) {
        if (this.handler) {
            this.handler.log(eventName, eventProperties);
        }
    },

    /**
     * Modifies the meta data to associate with the sender of events.
     *
     * @param {string} propertyName - A key for a property to associate with
     * the current Spot instance sending events.
     * @param {*} propertyValue - The value for the property.
     * @returns {void}
     */
    updateProperty(propertyName, propertyValue) {
        if (this.handler) {
            this.handler.updateProperty(propertyName, propertyValue);
        }
    }
};
