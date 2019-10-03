const keysToCheck = [ 'end', 'id', 'meetingUrl', 'start', 'title' ];

/**
 * Diffs two arrays of calendar events to check if there has been any meaningful
 * update between the two.
 *
 * @param {Array<Object>} oldEvents - The previous set of events to compare.
 * @param {Array<Object>} newEvents - The latest set of events to compare.
 * @returns {boolean} True if there has been a change in event data.
 */
export function hasUpdatedEvents(oldEvents, newEvents) {
    if (Boolean(oldEvents) !== Boolean(newEvents)) {
        return true;
    }

    const oldEventsCount = oldEvents.length;
    const newEventsCount = newEvents.length;

    if (oldEventsCount !== newEventsCount) {
        return true;
    }

    for (let i = 0; i < newEventsCount; i++) {
        const oldEvent = oldEvents[i] || {};
        const newEvent = newEvents[i] || {};
        const hasChange = keysToCheck.find(key =>
            oldEvent[key] !== newEvent[key]);

        if (hasChange) {
            return true;
        }
    }

    return false;
}
