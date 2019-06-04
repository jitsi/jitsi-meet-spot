import { calendarTypes } from 'common/app-state';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';

import { microsoftClientApi } from './microsoft-client-api';

/**
 * Functions for interacting with Outlook and its calendar API.
 */
export default {
    /**
     * Sets a previously loaded access token if available.
     *
     * @param {Object} config - Values needed to properly initialize the API.
     * @param {string} config.CLIENT_ID - The Outlook application client ID used
     * to make API requests.
     * @returns {Promise}
     */
    initialize(config) {
        return microsoftClientApi.initialize({
            clientId: config.CLIENT_ID,
            scopes: [
                'openid',
                'profile',
                'User.Read.All',
                'Calendars.Read',
                'Calendars.Read.Shared'
            ].join(' '),

            // FIXME: Account for Spot-TV being hosted within a path.
            redirectUri: `${window.location.origin}${ROUTES.OUTLOOK_OAUTH}`
        });
    },

    /**
     * Requests current Outlook calendar events for a provided email.
     *
     * @param {string} email - The Outlook-provided email of a meeting room or
     * the account email from which to request calendar events.
     * @returns {Promise<Array<Object>>}
     */
    getCalendar({ email }) {
        const now = new Date();
        const filter = `Start/DateTime ge '${now.toISOString()}'`;
        const url = `/users/${email}/calendar/events?$filter=${filter}&$top=3`;
        const orderBy = 'createdDateTime ASC';

        return microsoftClientApi.request(url, { orderBy })
            .then(response => response.value)
            .catch(response => {
                const formattedError = {
                    errorCode: response.code,
                    message: response.message,
                    statusCode: response.statusCode
                };

                logger.error(
                    'Outlook Calendar events fetch failed',
                    { error: formattedError }
                );

                return Promise.reject(formattedError);
            })
            .then(events => filterJoinableEvents(events));
    },

    /**
     * Returns which calendar integration is being implemented by this module.
     *
     * @returns {string}
     */
    getType() {
        return calendarTypes.OUTLOOK;
    },

    /**
     * Requests the rooms which are accessible by the Outlook email currently
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
 * @returns {Array<Event>}
 */
function filterJoinableEvents(events) {
    return events.map(event => {
        return {
            end: event.end.dateTime,
            id: event.id,
            meetingUrlFields: [
                event.onlineMeetingUrl,
                event.bodyPreview,
                event.location.displayName,
                event.subject,
                event.webLink
            ],
            participants: formatAttendees(event.attendees),
            start: event.start.dateTime,
            title: event.subject
        };
    });
}

/**
 * Formats the attendees into a standard format.
 *
 * @param {Array<Object>} attendees - All participants in the meeting.
 * @returns {Array<Participant>}
 */
function formatAttendees(attendees) {
    return attendees.map(attendee => {
        return {
            email: attendee.emailAddress.address
        };
    });
}
