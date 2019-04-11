import amplitude from 'amplitude-js';

/**
 * Wraps the details of communicating with the Amplitude analytics service.
 */
export default class AmplitudeHandler {
    /**
     * Initializes a new {@code AmplitudeHandler} instance.
     *
     * @param {string} deviceId - The user identifier for the current user.
     * @param {string} appKey - The key needed to associate events with a
     * project in Amplitude.
     */
    constructor(deviceId, appKey) {
        amplitude.getInstance().init(appKey);
        amplitude.setUserId(deviceId);
    }


    /**
     * Sends an event to the Amplitude project.
     *
     * @param {string} eventName - The identifying name of the event.
     * @param {Object} eventProperties - Additional details about the event.
     * @returns {void}
     */
    log(eventName, eventProperties = null) {
        amplitude.logEvent(eventName, eventProperties);
    }

    /**
     * Adds a user property to the current Amplitude user to attach to events.
     *
     * @param {string} propertyName - A key for a property to associate with
     * the current Spot instance sending events.
     * @param {*} propertyValue - The value for the property.
     * @returns {void}
     */
    updateProperty(propertyName, propertyValue) {
        amplitude.setUserProperties({ [propertyName]: propertyValue });
    }
}
