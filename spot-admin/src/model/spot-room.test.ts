import { jest } from '@jest/globals';

import { SpotRoom } from './spot-room.js';

describe('SpotRoom', () => {
    it('seeds the long-lived pairing code to the well-known 12345678', () => {
        const room = new SpotRoom('room-1', {});

        expect(room.getLongLivedPairingCode().code).toBe('12345678');
    });

    it('exposes generated tokens and mirrors id into mucUrl', () => {
        const room = new SpotRoom('room-1', { countryCode: 'US', name: 'Test', tenant: 't1' });

        expect(room.mucUrl).toBe('room-1');
        expect(room.countryCode).toBe('US');
        expect(room.name).toBe('Test');
        expect(room.tenant).toBe('t1');
        expect(room.getAccessToken().accessToken).toBeTruthy();
        expect(room.getAccessToken().refreshToken).toBeTruthy();
        expect(room.getShortLivedAccessToken().accessToken).toBeTruthy();
        expect(room.getShortLivedAccessToken().refreshToken).toBeUndefined();
    });

    it('uses the provided jwts as the access tokens when supplied', () => {
        const room = new SpotRoom('room-1', { jwt: 'my-jwt', shortLivedJwt: 'sl-jwt' });

        expect(room.getAccessToken().accessToken).toBe('my-jwt');
        expect(room.getShortLivedAccessToken().accessToken).toBe('sl-jwt');
    });

    it('preserves the refresh token across access-token regeneration', () => {
        const room = new SpotRoom('room-1', {});
        const refreshToken = room.getAccessToken().refreshToken;

        const next = room.regenerateAccessToken();

        expect(next.refreshToken).toBe(refreshToken);
        expect(next.accessToken).toBeTruthy();
    });

    it('lazily regenerates the long-lived pairing code once it expires', () => {
        jest.useFakeTimers();

        try {
            const room = new SpotRoom('room-1', {});

            expect(room.getLongLivedPairingCode().code).toBe('12345678');

            jest.advanceTimersByTime((60 * 60 * 1000) + 1);

            const regenerated = room.getLongLivedPairingCode().code;

            expect(regenerated).not.toBe('12345678');
            expect(regenerated.length).toBeLessThanOrEqual(8);
        } finally {
            jest.useRealTimers();
        }
    });

    it('renders all four credentials in toString()', () => {
        const room = new SpotRoom('room-xyz', {});
        const str = room.toString();

        expect(str).toContain('id: room-xyz');
        expect(str).toContain('AT:');
        expect(str).toContain('RT:');
        expect(str).toContain('LLPC: 12345678');
        expect(str).toContain('SLPC:');
        expect(str).toContain('SLAT:');
    });
});
