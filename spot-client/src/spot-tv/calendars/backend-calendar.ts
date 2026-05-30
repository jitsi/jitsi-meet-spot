import { calendarTypes } from 'common/app-state';
import { fetchCalendarEvents } from 'common/backend';

/**
 * The calendar's implementation based on REST API.
 */
export default {
    url: '' as string,

    /**
     * Loads the external script for accessing the backend calendar API.
     *
     * @param config - Values needed to properly initialize the API.
     * @param config.SERVICE_URL - The URL pointing to the backend endpoint which handles
     * the calendar requests.
     * @returns Resolves when the backend API has loaded.
     */
    initialize(config: { SERVICE_URL: string; }): Promise<void> {
        this.url = config.SERVICE_URL;

        return Promise.resolve();
    },

    /**
     * Requests current calendar events for a provided room.
     *
     * @returns
     */
    getCalendar({ jwt }: { jwt: string; }): Promise<any[]> {
        return fetchCalendarEvents(this.url, jwt)
            .then((response: any) => {
                const events = response && response.events;

                if (!events) {
                    return Promise.reject('No \'events\' in the response');
                }

                // Converts to Spot format
                // FIXME define a type for Spot's calendar event object
                const output: any[] = [];
                const MAX_EVENT_COUNT = 3;

                let i = 0;

                for (const inputEvent of events) {
                    if (++i > MAX_EVENT_COUNT) {
                        break;
                    }

                    output.push({
                        id: i,
                        meetingUrlFields: [
                            inputEvent.meetingLink,
                            inputEvent.summary
                        ],
                        start: inputEvent.start,
                        title: inputEvent.summary
                    });
                }

                return output;
            });
    },

    /**
     * Returns which calendar integration is being implemented by this module.
     *
     * @returns
     */
    getType(): string {
        return calendarTypes.BACKEND;
    },

    /**
     * Not implemented.
     *
     * @returns
     */
    getRooms(): Promise<any[]> {
        return Promise.resolve([]);
    },

    /**
     * Not implemented.
     *
     * @returns Resolves when sign in completes successfully.
     */
    triggerSignIn(): Promise<void> {
        return Promise.resolve();
    }
};
