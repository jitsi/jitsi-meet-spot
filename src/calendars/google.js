/* global gapi */

import config from 'config';
import { date } from 'utils';

export default {
    initialize() {
        const loadGapi = new Promise(resolve =>
            gapi.load('client:auth2', () => resolve()));

        return loadGapi
            .then(() => gapi.client.init({
                clientId: config.get('googleApiClientId'),
                scope: [
                    'https://www.googleapis.com/auth/'
                        + 'admin.directory.resource.calendar.readonly',
                    'https://www.googleapis.com/auth/calendar.readonly'
                ].join(' ')
            }));
    },

    isAuthenticated() {
        return Boolean(
            gapi
            && gapi.auth2
            && gapi.auth2.getAuthInstance
            && gapi.auth2.getAuthInstance().isSignedIn
            && gapi.auth2.getAuthInstance().isSignedIn.get()
        );
    },

    getCalendar(roomId) {
        const params = [
            'alwaysIncludeEmail=true',
            'orderBy=starttime',
            'singleEvents=true',
            `timeMax=${date.getEndOfDate().toISOString()}`,
            `timeMin=${date.getCurrentDate().toISOString()}`
        ].join('&');

        const calendarEventsEndpoint
            = `https://www.googleapis.com/calendar/v3/calendars/${roomId}/`
            + `events?${params}`;

        return gapi.client.request(calendarEventsEndpoint)
            .then(response => response.result.items);
    },

    getRooms() {
        const roomsListEndpoint
            = 'https://www.googleapis.com/admin/directory/v1/customer/'
                + 'my_customer/resources/calendars';

        return gapi.client.request(roomsListEndpoint)
            .then(response => response.result.items.filter(calendar =>
                calendar.resourceCategory === 'CONFERENCE_ROOM'));
    },

    triggerSignIn() {
        return this.initialize()
            .then(() => gapi.auth2.getAuthInstance().signIn());
    }
};

