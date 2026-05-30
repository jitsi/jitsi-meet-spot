import { segment } from './libs';

/**
 * Wraps the details of communicating with the Segment analytics service.
 */
export default class SegmentHandler {
    /**
     * Initializes a new {@code SegmentHandler} instance.
     *
     * @param deviceId - The user identifier for the current user.
     * @param appKey - The key needed to associate events with a
     * source in Segment.
     */
    constructor(deviceId: string, appKey: string) {
        segment.load(appKey);

        this.setId(deviceId);
    }

    /**
     * Sends an event to the Segment.
     *
     * @param eventName - The identifying name of the event.
     * @param eventProperties - Additional details about the event.
     * @returns {void}
     */
    log(eventName: string, eventProperties: any = null): void {
        segment.track(eventName, eventProperties);
    }

    /**
     * Records a "page" event in Segment.
     *
     * @param name - The name of the viewed page.
     * @param properties - Additional details about the event.
     * @returns {void}
     */
    page(name: string, properties: any): void {
        segment.page(name, properties);
    }

    /**
     * Updates the known id of the user.
     *
     * @param deviceId - The user identifier for the current user.
     * @returns {void}
     */
    setId(deviceId: string): void {
        segment.identify(deviceId, null);
    }

    /**
     * Adds a user property to the current Segment user to attach to events.
     *
     * @param propertyName - A key for a property to associate with
     * the current Spot instance sending events.
     * @param propertyValue - The value for the property.
     * @returns {void}
     */
    updateProperty(propertyName: string, propertyValue: any): void {
        (segment.identify as any)({ [propertyName]: propertyValue });
    }
}
