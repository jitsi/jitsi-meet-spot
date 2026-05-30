import type { Request, Response } from 'express';

import type { SpotRoom, Spots } from '../model/spot-room.js';
import { generateRandomString, send400Error, send500Error, sendJSON } from './utils.js';

const registerDeviceFailureRate
    = process.env.REG_DEVICE_FAILURE_RATE ? Number(process.env.REG_DEVICE_FAILURE_RATE) : 0;

console.info(`register-device failure rate: ${registerDeviceFailureRate}`);

/** Shape of the `PUT /pair` request body. */
interface PairRequestBody {
    endpointId?: string;
    pairingCode?: string;
}

/**
 * Exchanges a pairing code (long- or short-lived) for an access token.
 *
 * @param spots - The collection of mock rooms.
 * @param req - The Express request.
 * @param res - The Express response.
 */
export function registerDeviceController(spots: Spots, req: Request, res: Response): void {
    const { endpointId, pairingCode } = req.body as PairRequestBody;

    if (!pairingCode) {
        send400Error(res, '"pairingCode" is required');

        return;
    }

    if (registerDeviceFailureRate && Math.random() < registerDeviceFailureRate) {
        send500Error(res, 'Randomly failed /register-device');

        return;
    }

    let shortLived = false;
    let spotRoom: SpotRoom | null = null;

    for (const spot of spots.values()) {
        if (spot.getLongLivedPairingCode().code === pairingCode) {
            spotRoom = spot;
        }
    }

    // Note that there are no checks for roomName duplication
    if (!spotRoom) {
        // Try to match the remote pairing code
        for (const spot of spots.values()) {
            if (spot.getShortLivedPairingCode().code === pairingCode) {
                spotRoom = spot;
                shortLived = true;
            }
        }

        if (!spotRoom) {
            res.status(400);
            res.statusMessage = 'Invalid paring code';
            sendJSON(res, {
                messageKey: 'pairing.code.not.found'
            });
            res.end();

            return;
        }
    }

    const jwtStructure = shortLived ? spotRoom.getShortLivedAccessToken() : spotRoom.getAccessToken();

    const response = {
        accessToken: jwtStructure.accessToken,
        emitted: jwtStructure.emitted,
        endpointId: endpointId || generateRandomString(),
        expiresIn: jwtStructure.expiresIn,
        id: spotRoom.id,
        refreshToken: shortLived ? undefined : jwtStructure.refreshToken,
        tenant: spotRoom.tenant
    };

    sendJSON(res, response);
}
