import type { Request, Response } from 'express';

import type { SpotRoom, Spots } from '../model/spot-room.js';
import type { CalendarEvent } from '../types.js';
import { send400Error, send401Error, send500Error, sendJSON } from './utils.js';

const calendarFailureRate
    = process.env.CALENDAR_FAILURE_RATE ? Number(process.env.CALENDAR_FAILURE_RATE) : 0;

console.info(`calendar failure rate: ${calendarFailureRate}`);

/**
 * Returns a synthetic list of upcoming calendar events for the room that owns
 * the supplied bearer access token.
 *
 * @param spots - The collection of mock rooms.
 * @param req - The Express request.
 * @param res - The Express response.
 */
export function calendarRequestController(spots: Spots, req: Request, res: Response): void {
    if (calendarFailureRate && Math.random() < calendarFailureRate) {
        send500Error(res, 'Randomly failed /calendar');

        return;
    }

    const authorization = req.headers.authorization;

    if (!authorization || authorization.indexOf('Bearer ') !== 0) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, 'Invalid token');

        return;
    }

    const jwt = authorization.substring(7);
    let spotRoom: SpotRoom | null = null;

    for (const spot of spots.values()) {
        if (spot.getAccessToken().accessToken === jwt) {
            spotRoom = spot;
            break;
        }
    }

    if (!spotRoom) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, 'Invalid token');

        return;
    }

    const tzid = req.query.tzid;

    // Note that it's only a check for the 'tzid' presence, but it's not really used.
    // When date is formatted with the "toISOString" it includes the timezone and the client is able
    // to recognize the timezone anyway. A real backend will probably use it to figure out
    // the upcoming events.
    if (!tzid) {
        send400Error(res, '\'tzid\' query param is required');

        return;
    }

    let trailingEnd = new Date();
    const events: CalendarEvent[] = [];

    for (let i = 1; i < 12; i++) {
        const trailingStart = new Date(trailingEnd.getTime() + (10 * 60 * 60 * 1000));

        trailingEnd = new Date(trailingStart.getTime() + (30 * 60 * 1000));

        events.push({
            allDay: false,
            calendarId: 'cal_1',
            end: trailingEnd.toISOString(),
            eventId: 'evt_external_1',
            meetingLink: `https://meet.jit.si/meeting${i}`,
            start: trailingStart.toISOString(),
            summary: `Meeting ${i}`,
            updatable: true
        });
    }

    sendJSON(res, { events });
}
