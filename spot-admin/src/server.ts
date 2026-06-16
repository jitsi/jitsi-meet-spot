import 'dotenv/config';

import { jwtDecode } from 'jwt-decode';

import { createApp } from './app.js';
import { generateRandomString } from './backend/utils.js';
import { SpotRoom, type Spots } from './model/spot-room.js';

const PORT = 8001;

/**
 * Builds the single mock room, optionally seeded from environment variables,
 * and returns it inside a {@link Spots} map.
 *
 * @returns The seeded collection of rooms.
 */
function createSpots(): Spots {
    const spots: Spots = new Map();

    // Try to decode room ID from the token.
    const jwt = process.env.JWT;
    const jwtPayload = jwt ? jwtDecode<{ spotRoomId?: string; }>(jwt) : undefined;
    const roomIdFromJwt = jwtPayload?.spotRoomId;
    const spot1Id = roomIdFromJwt ?? `${generateRandomString()}_rooom1`;

    console.info(`Spot room id: ${spot1Id}`);

    const spot1 = new SpotRoom(spot1Id, {
        countryCode: process.env.COUNTRY_CODE,
        jwt,
        refreshToken: process.env.REFRESH_TOKEN,
        shortLivedJwt: process.env.JWT_SHORT_LIVED,
        tenant: process.env.TENANT
    });

    spots.set(spot1.id, spot1);

    return spots;
}

const app = createApp(createSpots());

app.listen(PORT, () => console.log(`Spot-admin app listening on port ${PORT}!`));
