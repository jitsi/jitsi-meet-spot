const keysToCheck = [ 'end', 'id', 'meetingUrl', 'start', 'title' ];

/**
 * Diffs two arrays of calendar events to check if there has been any meaningful
 * update between the two.
 *
 * @param oldEvents - The previous set of events to compare.
 * @param newEvents - The latest set of events to compare.
 * @returns True if there has been a change in event data.
 */
export function hasUpdatedEvents(
        oldEvents: Array<Record<string, any>>,
        newEvents: Array<Record<string, any>>
): boolean {
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
