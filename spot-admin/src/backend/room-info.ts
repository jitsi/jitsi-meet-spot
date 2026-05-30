import type { Request, Response } from 'express';

import type { SpotRoom, Spots } from '../model/spot-room.js';
import { send401Error, send500Error, sendJSON } from './utils.js';

const roomInfoFailureRate
    = process.env.ROOM_INFO_FAILURE_RATE ? Number(process.env.ROOM_INFO_FAILURE_RATE) : 0;

console.info(`room-info failure rate: ${roomInfoFailureRate}`);

/**
 * Returns the room info for the room that owns the supplied bearer access token.
 *
 * @param spots - The collection of mock rooms.
 * @param req - The Express request.
 * @param res - The Express response.
 */
export function roomInfoController(spots: Spots, req: Request, res: Response): void {
    const authorization = req.headers.authorization;

    if (!authorization || authorization.indexOf('Bearer ') !== 0) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, 'Invalid token');

        return;
    }

    const jwt = authorization.substring(7);

    if (roomInfoFailureRate && Math.random() < roomInfoFailureRate) {
        send500Error(res, 'Randomly failed /room-info');

        return;
    }

    let spotRoom: SpotRoom | null = null;

    for (const room of spots.values()) {
        if (room.getAccessToken().accessToken === jwt
                || room.getShortLivedAccessToken().accessToken === jwt) {
            spotRoom = room;
            break;
        }
    }

    if (!spotRoom) {
        send401Error(res, `No spot room found for jwt: ${jwt}`);

        return;
    }

    sendJSON(res, {
        countryCode: spotRoom.countryCode,
        id: spotRoom.id,
        mucUrl: spotRoom.mucUrl,
        name: spotRoom.name
    });
}
