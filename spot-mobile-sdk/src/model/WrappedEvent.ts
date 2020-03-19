/**
 * Model class representing a wrapped event that is bubbled up from a subcomponent of the SDK.
 */
export default class WrappedEvent {
    /**
     * The name of the event that'll be used on the external API.
     */
    public eventName: string;

    /**
     * Any type of param to be emitted together with the event.
     */
    public eventParam: any;

    /**
     * Instantiates a new {@code WrappedEvent} instance.
     *
     * @param {string} eventName - The name of the event that'll be used on the external API.
     * @param {any} eventParam - Any type of param to be emitted together with the event.
     */
    constructor(eventName: string, eventParam: any) {
        this.eventName = eventName;
        this.eventParam = eventParam;
    }
}
