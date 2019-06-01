import { calendarTypes } from 'common/app-state';
import { logger } from 'common/logger';
import { ROUTES } from 'common/routing';
import { isValidMeetingUrl } from 'common/utils';

import { getMeetingUrl } from './event-parsers';
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
        this.config = config;

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
            .then(events =>
                filterJoinableEvents(events, this.config.knownDomains));
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
 * @param {Array<string>} knownDomains - Whitelist of domains which can be used
 * as meeting links.
 * @returns {Array<Object>}
 */
function filterJoinableEvents(events, knownDomains) {
    return events.map(event => {
        const { attendees, end, id, location, start, subject } = event;
        const meetingUrl = getMeetingUrl([
            event.onlineMeetingUrl,
            event.bodyPreview,
            location.displayName,
            event.subject,
            event.webLink
        ], knownDomains);

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
