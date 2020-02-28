import { debugEvents } from './events';

/**
 * Logs analytic event if it appears that a calendar push notification hasn't arrived  when it should have.
 */
class MissedCalendarPushDetection {
    /**
     * Initializes the instance.
     *
     * @param {Analytics} analytics - The Analytics service instance.
     */
    constructor(analytics) {
        this.analytics = analytics;
        this.initializedEvents = false;
    }

    /**
     * This method must be called whenever the calendar service updates the list of calendar events.
     *
     * NOTE: At the time of this writing the calendar service emits updates only when events change. This allows to keep
     * the detection logic simpler. If there's too many CALENDAR_PUSH_MISSED events logged it means either that the push
     * notifications are not sent as they should or the calendar service started misfiring events.
     *
     * @param {Array} events - The list of calendar events.
     * @param {boolean} isPolling - Tells if the event's source is polling action or a push.
     * @param {boolean} isPushEnabled - Tells whether or not the calendar push notifications are currently enabled on
     * the deployment.
     * @returns {void}
     */
    onCalendarServiceUpdate(events, isPolling, isPushEnabled) {
        if (!isPushEnabled) {
            this.initializedEvents = false;

            return;
        }

        if (!this.initializedEvents) {
            this.initializedEvents = true;
        } else if (!isPolling) {
            this.analytics.log(debugEvents.CALENDAR_PUSH_MISSED);
        }
    }
}

export default MissedCalendarPushDetection;
