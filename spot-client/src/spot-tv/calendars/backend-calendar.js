import { calendarTypes } from 'common/app-state';
import { fetchCalendarEvents } from 'common/backend';

/**
 * The calendar's implementation based on REST API.
 */
export default {
    /**
     * Loads the external script for accessing the backend calendar API.
     *
     * @param {Object} config - Values needed to properly initialize the API.
     * @param {string} config.SERVICE_URL - The URL pointing to the backend endpoint which handles
     * the calendar requests.
     * @returns {Promise} Resolves when the backend API has loaded.
     */
    initialize(config) {
        this.url = config.SERVICE_URL;

        return Promise.resolve();
    },

    /**
     * Requests current calendar events for a provided room.
     *
     * @returns {Promise<Array<Object>>}
     */
    getCalendar({ jwt }) {
        return fetchCalendarEvents(this.url, jwt)
            .then(response => {
                const events = response && response.events;

                if (!events) {
                    return Promise.reject('No \'events\' in the response');
                }

                // Converts to Spot format
                // FIXME define a type for Spot's calendar event object
                const output = [];
                const MAX_EVENT_COUNT = 3;
                let i = 0;

                for (const inputEvent of events) {
                    if (++i > MAX_EVENT_COUNT) {
                        break;
                    }

                    output.push({
                        id: i,
                        meetingUrlFields: [ inputEvent.meetingLink, inputEvent.summary ],
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
     * @returns {string}
     */
    getType() {
        return calendarTypes.BACKEND;
    },

    /**
     * Not implemented.
     *
     * @returns {Promise<Array<Object>>}
     */
    getRooms() {
        return Promise.resolve([]);
    },

    /**
     * Not implemented.
     *
     * @returns {Promise} Resolves when sign in completes successfully.
     */
    triggerSignIn() {
        return Promise.resolve();
    }
};

