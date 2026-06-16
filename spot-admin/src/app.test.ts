import request from 'supertest';

import { createApp } from './app.js';
import { SpotRoom, type Spots } from './model/spot-room.js';

describe('spot-admin app', () => {
    let spots: Spots;
    let room: SpotRoom;
    let app: ReturnType<typeof createApp>;

    beforeEach(() => {
        room = new SpotRoom('room-1', { countryCode: 'US', name: 'Test Room', tenant: 'tenant-1' });
        spots = new Map([ [ room.id, room ] ]);
        app = createApp(spots);
    });

    describe('PUT /pair', () => {
        it('exchanges the long-lived pairing code for an access + refresh token', async () => {
            const res = await request(app)
                .put('/pair')
                .send({ pairingCode: '12345678', endpointId: 'endpoint-1' });

            expect(res.status).toBe(200);
            expect(res.body.id).toBe('room-1');
            expect(res.body.endpointId).toBe('endpoint-1');
            expect(res.body.accessToken).toBe(room.getAccessToken().accessToken);
            expect(res.body.refreshToken).toBe(room.getAccessToken().refreshToken);
        });

        it('exchanges the short-lived pairing code without a refresh token', async () => {
            const shortLivedCode = room.getShortLivedPairingCode().code;

            const res = await request(app)
                .put('/pair')
                .send({ pairingCode: shortLivedCode });

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBe(room.getShortLivedAccessToken().accessToken);
            expect(res.body.refreshToken).toBeUndefined();
        });

        it('returns 400 when pairingCode is missing', async () => {
            const res = await request(app).put('/pair').send({});

            expect(res.status).toBe(400);
        });

        it('returns 400 with a messageKey for an unknown pairing code', async () => {
            const res = await request(app).put('/pair').send({ pairingCode: 'does-not-exist' });

            expect(res.status).toBe(400);
            expect(res.body.messageKey).toBe('pairing.code.not.found');
        });
    });

    describe('POST /pair/code', () => {
        it('mints a short-lived pairing code by default', async () => {
            const res = await request(app)
                .post('/pair/code')
                .set('Authorization', `Bearer ${room.getAccessToken().accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.pairingType).toBe('SHORT_LIVED');
            expect(res.body.code).toBeTruthy();
        });

        it('mints a long-lived pairing code when requested', async () => {
            const res = await request(app)
                .post('/pair/code?pairingType=LONG_LIVED')
                .set('Authorization', `Bearer ${room.getAccessToken().accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.pairingType).toBe('LONG_LIVED');
        });

        it('returns 401 without an Authorization header', async () => {
            const res = await request(app).post('/pair/code');

            expect(res.status).toBe(401);
        });
    });

    describe('PUT /pair/regenerate', () => {
        it('refreshes the access token for a valid refresh token', async () => {
            const refreshToken = room.getAccessToken().refreshToken;

            const res = await request(app).put('/pair/regenerate').send({ refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeTruthy();
        });

        it('returns 400 when refreshToken is missing', async () => {
            const res = await request(app).put('/pair/regenerate').send({});

            expect(res.status).toBe(400);
        });

        it('returns 401 for an invalid refresh token', async () => {
            const res = await request(app).put('/pair/regenerate').send({ refreshToken: 'invalid' });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /room/info', () => {
        it('returns the room info for a valid access token', async () => {
            const res = await request(app)
                .get('/room/info')
                .set('Authorization', `Bearer ${room.getAccessToken().accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                countryCode: 'US',
                id: 'room-1',
                mucUrl: 'room-1',
                name: 'Test Room'
            });
        });

        it('returns 401 without an Authorization header', async () => {
            const res = await request(app).get('/room/info');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /calendar', () => {
        it('returns 11 synthetic events for a valid token and tzid', async () => {
            const res = await request(app)
                .get('/calendar?tzid=UTC')
                .set('Authorization', `Bearer ${room.getAccessToken().accessToken}`);

            expect(res.status).toBe(200);
            expect(res.body.events).toHaveLength(11);
            expect(res.body.events[0].meetingLink).toBe('https://meet.jit.si/meeting1');
            expect(res.body.events[0].summary).toBe('Meeting 1');
        });

        // Regression guard: the original JS called send400Error without importing it,
        // which threw at runtime whenever tzid was missing.
        it('returns 400 when tzid is missing', async () => {
            const res = await request(app)
                .get('/calendar')
                .set('Authorization', `Bearer ${room.getAccessToken().accessToken}`);

            expect(res.status).toBe(400);
        });

        it('returns 401 without an Authorization header', async () => {
            const res = await request(app).get('/calendar?tzid=UTC');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /health', () => {
        it('returns 200 without authentication', async () => {
            const res = await request(app).get('/health');

            expect(res.status).toBe(200);
        });
    });

    describe('seeded refresh token', () => {
        it('uses the seeded refresh token and accepts it at /pair/regenerate', async () => {
            const seededRoom = new SpotRoom('seeded-room', { refreshToken: 'e2e-backend-refresh-token' });
            const seededApp = createApp(new Map([ [ seededRoom.id, seededRoom ] ]));

            expect(seededRoom.getAccessToken().refreshToken).toBe('e2e-backend-refresh-token');

            const res = await request(seededApp)
                .put('/pair/regenerate')
                .send({ refreshToken: 'e2e-backend-refresh-token' });

            expect(res.status).toBe(200);
            expect(res.body.accessToken).toBeTruthy();

            // The refresh token survives the regeneration triggered by /pair/regenerate.
            expect(seededRoom.getAccessToken().refreshToken).toBe('e2e-backend-refresh-token');
        });
    });
});
