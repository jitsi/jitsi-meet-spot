/**
 * @typedef Object CalendarEvent
 * @property {boolean} allDay
 * @property {string} calendarId
 * @property {string} description
 * @property {string} end - The end date as formatted with {@link Date.toISOString()}.
 * @property {string} eventId
 * @property {string} meetingLink
 * @property {string} start - The start date as formatted with {@link Date.toISOString()}.
 * @property {string} summary
 * @property {boolean} updatable
 */

const { send401Error, send500Error, sendJSON } = require('./utils');

const calendarFailureRate = process.env.CALENDAR_FAILURE_RATE;

console.info('calendar failure rate: ' + calendarFailureRate);

function calendarRequestController(spots, req, res) {
    if (calendarFailureRate && Math.random() < calendarFailureRate) {
        send500Error(res, "Randomly failed /calendar");

        return;
    }

    const authorization = req.headers['authorization'];
    const jwt = authorization.substring(7);
    let spotRoom = null;
    for (const spot of spots.values()) {
        if (spot.getAccessToken().accessToken === jwt) {
            spotRoom = spot;
            break;
        }
    }

    if (!spotRoom) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, `Invalid token`);

        return;
    }

    const tzid = req.query['tzid'];

    // Note that it's only a checks for the 'tzid' presence, but it's not really used.
    // When date is formatted with the "toISOString" it includes the timezone and the client is able
    // to recognize the timezone anyway. A real backend will probably use it to figure out
    // the upcoming events.
    if (!tzid) {
        send400Error(res, '\'tzid\' query param is required');

        return;
    }

    let trailingStart = new Date();
    let trailingEnd = new Date();
    const events = [];

    for (let i = 1; i < 12; i++) {
        trailingStart = new Date(trailingEnd.getTime() + 10 * 60 * 60 * 1000);
        trailingEnd = new Date(trailingStart.getTime() + 30 * 60 * 1000);

        events.push({
            "calendarId": "cal_1",
            "eventId": "evt_external_1",
            "summary": "Meeting " + i,
            "meetingLink": "https://meet.jit.si/meeting" + i,
            "start": trailingStart.toISOString(),
            "end": trailingEnd.toISOString(),
            "updatable": true,
            "allDay": false
        });
    }

    sendJSON(res, { events });
}

module.exports = calendarRequestController;
