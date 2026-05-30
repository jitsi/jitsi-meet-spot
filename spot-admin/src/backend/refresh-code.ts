import type { Request, Response } from 'express';

import type { SpotRoom, Spots } from '../model/spot-room.js';
import { send400Error, send401Error, send500Error, sendJSON } from './utils.js';

const refreshCodeFailureRate
    = process.env.REFRESH_CODE_FAILURE_RATE ? Number(process.env.REFRESH_CODE_FAILURE_RATE) : 0;

console.info(`refresh-code failure rate: ${refreshCodeFailureRate}`);

const refreshCodeRejectRate
    = process.env.REFRESH_CODE_REJECT_RATE ? Number(process.env.REFRESH_CODE_REJECT_RATE) : 0;

console.info(`refresh-code reject rate: ${refreshCodeRejectRate}`);

/** Shape of the `PUT /pair/regenerate` request body. */
interface RefreshRequestBody {
    refreshToken?: string;
}

/**
 * Refreshes an access token given a valid refresh token.
 *
 * @param spots - The collection of mock rooms.
 * @param req - The Express request.
 * @param res - The Express response.
 */
export function refreshController(spots: Spots, req: Request, res: Response): void {
    const { refreshToken } = req.body as RefreshRequestBody;

    if (!refreshToken) {
        send400Error(res, '"refreshToken" is required');

        return;
    }

    if (refreshCodeFailureRate && Math.random() < refreshCodeFailureRate) {
        send500Error(res, 'Randomly failed /regenerate');

        return;
    }

    let spotRoom: SpotRoom | null = null;

    for (const spot of spots.values()) {
        if (spot.getAccessToken().refreshToken === refreshToken) {
            spotRoom = spot;
            break;
        }
    }

    // Note that there are no checks for roomName duplication
    if (!spotRoom) {
        send401Error(res, 'Invalid refresh token');

        return;
    }

    if (refreshCodeRejectRate && Math.random() < refreshCodeRejectRate) {
        send401Error(res, 'Randomly denied /regenerate');

        return;
    }

    const jwtToken = spotRoom.regenerateAccessToken();

    const response = {
        accessToken: jwtToken.accessToken,
        emitted: jwtToken.emitted,
        expiresIn: jwtToken.expiresIn,
        tenant: spotRoom.tenant
    };

    sendJSON(res, response);
}
