/* global gapi */

import { CLIENT_ID } from 'config';
import { date } from 'utils';

/**
 * Functions for interacting with Google and its calendar API.
 */
export default {
    /**
     * Loads the external script for accessing the Google API.
     *
     * @returns {Promise} Resolves when the Google API javascript has loaded.
     */
    initialize() {
        const loadGapi = new Promise(resolve =>
            gapi.load('client:auth2', () => resolve()));

        return loadGapi
            .then(() => gapi.client.init({
                clientId: CLIENT_ID,
                scope: [
                    'https://www.googleapis.com/auth/'
                        + 'admin.directory.resource.calendar.readonly',
                    'https://www.googleapis.com/auth/calendar.readonly'
                ].join(' ')
            }));
    },

    /**
     * Checks if currently signed in to Google.
     *
     * @returns {boolean} True if currently signed in with the Google.
     */
    isAuthenticated() {
        return Boolean(
            gapi
            && gapi.auth2
            && gapi.auth2.getAuthInstance
            && gapi.auth2.getAuthInstance().isSignedIn
            && gapi.auth2.getAuthInstance().isSignedIn.get()
        );
    },

    /**
     * Requests current Google calendar events for a provided room.
     *
     * @param {string} roomId - The Google-provided id of the room from which to
     * request calendar events.
     * @returns {Promise<Array<Object>>}
     */
    getCalendar(roomId) {
        const params = [
            'alwaysIncludeEmail=true',
            'orderBy=starttime',
            'singleEvents=true',
            `timeMax=${date.getEndOfDate(date.getCurrentDate()).toISOString()}`,
            `timeMin=${date.getCurrentDate().toISOString()}`
        ].join('&');

        const calendarEventsEndpoint
            = `https://www.googleapis.com/calendar/v3/calendars/${roomId}/`
            + `events?${params}`;

        return gapi.client.request(calendarEventsEndpoint)
            .then(response => response.result.items);
    },

    /**
     * Requests the rooms accessible by the Google calendar of the email
     * currently authenticated with the Google API.
     *
     * @returns {Promise<Array<Object>>}
     */
    getRooms() {
        const roomsListEndpoint
            = 'https://www.googleapis.com/admin/directory/v1/customer/'
                + 'my_customer/resources/calendars';

        return gapi.client.request(roomsListEndpoint)
            .then(response => response.result.items.filter(calendar =>
                calendar.resourceCategory === 'CONFERENCE_ROOM'));
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
