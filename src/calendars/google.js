/* global gapi */

import { CLIENT_ID } from 'config';
import { date, isValidMeetingUrl } from 'utils';

import { integrationTypes } from './constants';
import { getMeetingUrl } from './event-parsers';

let initPromise;

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
        if (initPromise) {
            return initPromise;
        }

        initPromise = new Promise(resolve =>
            gapi.load('client:auth2', () => resolve()));

        return initPromise
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
     * Requests current Google calendar events for a provided room.
     *
     * @param {string} email - The Google-provided id of a meeting room (which
     * looks like an email) or the account email from which to request calendar
     * events.
     * @returns {Promise<Array<Object>>}
     */
    getCalendar(email) {
        const params = [
            'alwaysIncludeEmail=true',
            'orderBy=starttime',
            'singleEvents=true',
            `timeMax=${date.getEndOfDate(date.getCurrentDate()).toISOString()}`,
            `timeMin=${date.getCurrentDate().toISOString()}`
        ].join('&');

        const calendarEventsEndpoint
            = `https://www.googleapis.com/calendar/v3/calendars/${email}/`
            + `events?${params}`;

        return gapi.client.request(calendarEventsEndpoint)
            .then(response => response.result.items)
            .then(events => filterJoinableEvents(events, email));
    },

    /**
     * Returns which calendar integration is being implemented by this module.
     *
     * @returns {string}
     */
    getType() {
        return integrationTypes.GOOGLE;
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

/**
 * Converts the passed in events into a standard format expected by UI features.
 *
 * @param {Array<Object>} events
 * @param {string} calendarEmail
 * @returns {Array<Object>}
 */
function filterJoinableEvents(events = [], calendarEmail) {
    return events.map(event => {
        const { attendees, location, end, id, start, summary } = event;
        const meetingUrl = getMeetingUrl(location);

        return {
            end: end.dateTime,
            id,
            meetingUrl: isValidMeetingUrl(meetingUrl) ? meetingUrl : null,
            participants: filterAttendees(attendees, calendarEmail),
            start: start.dateTime,
            title: summary
        };
    });
}

/**
 * Removes the currently configured calendar from the attendees and formats
 * the attendees to a standard format.
 *
 * @param {Array<Object>} attendees
 * @param {string} currentCalendar
 * @returns {Array<Object>}
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
