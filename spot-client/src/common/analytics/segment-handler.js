import { segment } from './libs';

/**
 * Wraps the details of communicating with the Segment analytics service.
 */
export default class SegmentHandler {
    /**
     * Initializes a new {@code SegmentHandler} instance.
     *
     * @param {string} deviceId - The user identifier for the current user.
     * @param {string} appKey - The key needed to associate events with a
     * source in Segment.
     */
    constructor(deviceId, appKey) {
        segment.load(appKey);

        segment.identify(deviceId);
    }

    /**
     * Sends an event to the Segment.
     *
     * @param {string} eventName - The identifying name of the event.
     * @param {Object} eventProperties - Additional details about the event.
     * @returns {void}
     */
    log(eventName, eventProperties = null) {
        segment.track(eventName, eventProperties);
    }

    /**
     * Adds a user property to the current Segment user to attach to events.
     *
     * @param {string} propertyName - A key for a property to associate with
     * the current Spot instance sending events.
     * @param {*} propertyValue - The value for the property.
     * @returns {void}
     */
    updateProperty(propertyName, propertyValue) {
        segment.identify({ [propertyName]: propertyValue });
    }
}
