import type { Request, Response } from 'express';

import type { SpotRoom, Spots } from '../model/spot-room.js';
import { send400Error, send401Error, sendJSON } from './utils.js';

const LONG_LIVED_PAIRING_TYPE = 'LONG_LIVED';
const SHORT_LIVED_PAIRING_TYPE = 'SHORT_LIVED';

/**
 * Mints a new remote pairing code (short- or long-lived) for the room that owns
 * the supplied bearer access token.
 *
 * @param spots - The collection of mock rooms.
 * @param req - The Express request.
 * @param res - The Express response.
 */
export function remotePairingCodeController(spots: Spots, req: Request, res: Response): void {
    const authorization = req.headers.authorization;

    if (!authorization || authorization.indexOf('Bearer ') !== 0) {
        console.info(`Invalid token, "Authorization" header = ${authorization}`);
        send401Error(res, 'Invalid token');

        return;
    }

    const jwt = authorization.substring(7);

    const rawPairingType = req.query.pairingType;
    const pairingType = (typeof rawPairingType === 'string' ? rawPairingType : SHORT_LIVED_PAIRING_TYPE).toUpperCase();

    if (pairingType !== SHORT_LIVED_PAIRING_TYPE && pairingType !== LONG_LIVED_PAIRING_TYPE) {
        send400Error(res, 'Invalid pairing type');

        return;
    }

    let spotRoom: SpotRoom | null = null;

    for (const room of spots.values()) {
        if (room.getAccessToken().accessToken === jwt) {
            spotRoom = room;
            break;
        }
    }

    if (!spotRoom) {
        send401Error(res, `No spot room found for the given JWT: ${jwt}`);

        return;
    }

    const remotePairingCode
        = pairingType === SHORT_LIVED_PAIRING_TYPE
            ? spotRoom.generateShortLivedPairingCode()
            : spotRoom.generateLongLivedPairingCode();

    sendJSON(res, {
        code: remotePairingCode.code,
        emitted: remotePairingCode.emitted,
        expiresIn: remotePairingCode.expiresIn,
        pairingType
    });
}
