/* global gapi */

import { calendarTypes } from 'common/app-state';
import { logger } from 'common/logger';
import { date } from 'common/utils';

let initPromise;

/**
 * Functions for interacting with Google and its calendar API.
 */
export default {
    /**
     * Loads the external script for accessing the Google API.
     *
     * @param {Object} config - Values needed to properly initialize the API.
     * @param {string} config.CLIENT_ID - The Google application client ID used
     * to make API requests.
     * @returns {Promise} Resolves when the Google API javascript has loaded.
     */
    initialize(config) {
        if (initPromise) {
            return initPromise;
        }

        initPromise = new Promise(resolve =>
            gapi.load('client:auth2', () => resolve()));

        return initPromise
            .then(() => gapi.client.init({
                clientId: config.CLIENT_ID,
                scope: [
                    'https://www.googleapis.com/auth/'
                        + 'admin.directory.resource.calendar.readonly',
                    'https://www.googleapis.com/auth/calendar.readonly'
                ].join(' ')
            }));
    },

    /**
     * Requests current Google calendar events for a provided resource.
     *
     * @param {string} email - The Google-provided id of a meeting room (which
     * looks like an email) or the account email from which to request calendar
     * events.
     * @returns {Promise<Array<Object>>}
     */
    getCalendar({ email }) {
        const params = [
            'alwaysIncludeEmail=true',
            'maxResults=3',
            'orderBy=starttime',
            'singleEvents=true',
            `timeMin=${date.getCurrentDate().toISOString()}`
        ].join('&');

        const calendarEventsEndpoint
            = `https://www.googleapis.com/calendar/v3/calendars/${email}/`
            + `events?${params}`;

        return gapi.client.request(calendarEventsEndpoint)
            .then(response => response.result.items)
            .catch(response => {
                const formattedError = {
                    errorCode: response.result.error.errors[0].domain,
                    message: response.result.error.message,
                    statusCode: response.status
                };

                logger.error(
                    'Google Calendar events fetch failed',
                    { error: formattedError }
                );

                return Promise.reject(formattedError);
            })
            .then(events =>
                filterJoinableEvents(events, email));
    },

    /**
     * Returns which calendar integration is being implemented by this module.
     *
     * @returns {string}
     */
    getType() {
        return calendarTypes.GOOGLE;
    },

    /**
     * Requests the rooms accessible by the Google calendar of the email
     * currently authenticated with the Google API.
     *
     * @param {string} roomNameFilter - Filter results so only room names that
     * begin with the specified string are returned. Google only allows
     * searching from the start of the room name and is case sensitive.
     * @returns {Promise<Array<Object>>}
     */
    getRooms(roomNameFilter = '') {
        const escapedQuery = encodeURIComponent(`name:"${roomNameFilter}*"`);
        const roomsListEndpoint
            = 'https://www.googleapis.com/admin/directory/v1/customer/'
                + 'my_customer/resources/calendars'
                + `?maxResults=5&query=${escapedQuery}`;

        return gapi.client.request(roomsListEndpoint)
            .then(response => response.result.items.filter(
                ({ resourceCategory, resourceType = '' }) => {
                    if (resourceCategory === 'CONFERENCE_ROOM') {
                        return true;
                    }

                    const lowercaseResourceType = resourceType.toLowerCase();

                    return lowercaseResourceType.includes('conference');
                }));
    },

    /**
     * Display the Google sign in flow.
     *
     * @returns {Promise} Resolves when sign in completes successfully.
     */
    triggerSignIn() {
        return this.initialize()
            .then(() => gapi.auth2.getAuthInstance().signIn());
    }
};

/**
 * Converts the passed in events into a standard format expected by UI features.
 *
 * @param {Array<Object>} events - The calendar events to filter.
 * @param {string} calendarEmail - The email of the calendar configured to
 * display.
 * @returns {Array<Event>}
 */
function filterJoinableEvents(events = [], calendarEmail) {
    return events.map(event => {
        return {
            end: event.end.dateTime,
            id: event.id,
            meetingUrlFields: [
                event.title,
                event.url,
                event.location,
                event.summary,
                event.notes,
                event.description
            ],
            participants: filterAttendees(event.attendees, calendarEmail),
            start: event.start.dateTime,
            title: event.summary
        };
    });
}

/**
 * Removes the currently configured calendar from the attendees and formats
 * the attendees to a standard format.
 *
 * @param {Array<Object>} attendees - All participants in the event.
 * @param {string} currentCalendar - The email of the calendar configured to
 * display.
 * @returns {Array<Participant>}
 */
function filterAttendees(attendees = [], currentCalendar) {
    const otherAttendees = attendees.filter(attendee =>
        attendee.email !== currentCalendar);

    return otherAttendees.map(attendee => {
        return {
            email: attendee.email
        };
    });
}
