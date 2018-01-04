/* global gapi */

const GOOGLE_API_ROOM = 'https://www.googleapis.com';

function generateCalendarResourcesApi(customerId) {
    const url = `${GOOGLE_API_ROOM}/admin/directory/v1/customer/${
        customerId}/resources/calendars`;

    console.log(url);

    return url;
}

function generateGetCalendarApi(roomId) {
    return `${GOOGLE_API_ROOM}/calendar/v3/calendars/${roomId}/events`;
}

const SCOPES = [
    `${GOOGLE_API_ROOM}/auth/admin.directory.resource.calendar.readonly`
].join(' ');

const DISCOVERY_DOCS = [
    'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
];
const googleApi = {
    authenticate(clientId, apiKey) {
        return this.load()
            .then(() => {
                return gapi.client.init({
                    apiKey,
                    clientId,
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES
                });
            });
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

    get() {
        return gapi;
    },

    getCalendar(roomId) {
        return gapi.client.request(generateGetCalendarApi(roomId))
            .then(response => response.result.items);
    },

    getRooms() {
        return gapi.client.request(generateCalendarResourcesApi('my_customer'))
            .then(response => {
                const allCalendars = response.result.items;

                return allCalendars.filter(calendar => {
                    return calendar.resourceCategory === 'CONFERENCE_ROOM';
                });
            });
    },

    load() {
        return new Promise((resolve) => {
            gapi.load('client:auth2', () => {
                return resolve();
            });
        })
    },

    triggerSignIn() {
         return gapi.auth2.getAuthInstance().signIn();
    }
};

export default googleApi;
