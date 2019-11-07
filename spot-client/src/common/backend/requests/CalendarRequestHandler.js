import { RequestHandler } from './RequestHandler';
import { createHeaders } from './utils';

/**
 * FIXME.
 */
export default class CalendarRequestHandler extends RequestHandler {
    /**
     * FIXME.
     *
     * @param {string} url - FIXME.
     * @returns {*}
     */
    constructor(url) {
        super({});

        if (!url) {
            throw new Error('The "url" is required');
        }
        if (!url.includes('{tzid}')) {
            return throw new Error(`Missing {tzid} template in the URL: ${url}`);
        }

        // eslint-disable-next-line new-cap
        this.url = url.replace('{tzid}', Intl.DateTimeFormat().resolvedOptions().timeZone);
    }

    /**
     * @typedef {Object} RESTBackendCalendarEvent
     * @property {boolean} allDay
     * @property {string} calendarId
     * @property {string} description
     * @property {string} end - The end date as formatted with {@link Date.toISOString()}.
     * @property {string} eventId
     * @property {string} meetingLink
     * @property {string} start - The start date as formatted with {@link Date.toISOString()}.
     * @property {string} summary - The title ?
     * @property {boolean} updatable
     */
    /**
     * Retrieves the list of calendar events.
     *
     * @param {string} jwt - The JWT required for authentication.
     * @returns {Promise<Array<RESTBackendCalendarEvent>>}
     */
    fetchCalendarEvents(jwt) {
        if (!jwt) {
            return Promise.reject('JWT is required to request calendar events');
        }

        const requestOptions = {
            headers: createHeaders(jwt),
            method: 'GET',
            mode: 'cors'
        };

        return this.fetchWithRetry({
            operationName: 'get calendar events',
            requestOptions,
            url: this.url
        });
    }
}
