import { MICROSOFT_CLIENT_ID } from 'config';
import { isValidMeetingUrl } from 'utils';

import { integrationTypes } from './constants';
import { getMeetingUrl } from './event-parsers';
import { microsoftClientApi } from './microsoft-client-api';

/**
 * Functions for interacting with Outlook and its calendar API.
 */
export default {
    /**
     * Sets a previously loaded access token if available.
     *
     * @returns {Promise}
     */
    initialize() {
        return microsoftClientApi.initialize({
            clientId: MICROSOFT_CLIENT_ID,
            scopes: [
                'openid',
                'profile',
                'User.Read.All',
                'Calendars.Read',
                'Calendars.Read.Shared'
            ].join(' '),
            redirectUri: `${window.location.origin}${window.location.pathname}`
        });
    },

    /**
     * Requests current Outlook calendar events for a provided email.
     *
     * @param {string} email - The Outlook-provided email of a meeting room or
     * the account email from which to request calendar events.
     * @returns {Promise<Array<Object>>}
     */
    getCalendar(email) {
        return microsoftClientApi.request(`/users/${email}/calendar/events`)
            .then(response => response.value)
            .then(events => filterJoinableEvents(events, email));
    },

    /**
     * Returns which calendar integration is being implemented by this module.
     *
     * @returns {string}
     */
    getType() {
        return integrationTypes.OUTLOOK;
    },

    /**
     * Requests the rooms accessible by the Outlook email currently
     * authenticated with the Microsoft Graph Client.
     *
     * @returns {Promise<Array<Object>>}
     */
    getRooms() {
        return microsoftClientApi.request('/me/findRooms', { version: 'beta' })
            .then(({ value }) => value.map(room => {
                return {
                    resourceEmail: room.address,
                    resourceName: room.name
                };
            }));
    },

    /**
     * Display the Microsoft Graph sign in flow.
     *
     * @returns {Promise} Resolves when sign in completes successfully.
     */
    triggerSignIn() {
        return microsoftClientApi.signIn();
    }
};

/**
 * Converts the passed in events into a standard format.
 *
 * @param {Array<Object>} events - The calendar events from the GET for events.
 * @returns {Array<Object>}
 */
function filterJoinableEvents(events) {
    return events.map(event => {
        const { attendees, end, id, location, start, subject } = event;
        const meetingUrl = getMeetingUrl(location.displayName);

        return {
            end: end.dateTime,
            id,

            // TODO: vet where the meeting URL is located in the payload
            meetingUrl: isValidMeetingUrl(meetingUrl) ? meetingUrl : null,
            participants: formatAttendees(attendees),
            start: start.dateTime,
            title: subject
        };
    });
}

/**
 * Formats the attendees into a standard format.
 *
 * @param {Array<Object>} attendees - All participants in the meeting.
 * @returns {Array<Object>}
 */
function formatAttendees(attendees) {
    return attendees.map(attendee => {
        return {
            email: attendee.emailAddress.address
        };
    });
}
