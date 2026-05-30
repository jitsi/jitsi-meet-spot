import { jest } from '@jest/globals';
import type { Response } from 'express';

import {
    generateExpiresAndExpiresIn,
    generateRandomString,
    send400Error,
    send401Error,
    send404Error,
    send500Error,
    sendJSON
} from './utils.js';

/** Builds a minimal mock Express Response that records the calls made to it. */
function mockResponse() {
    const res = {
        statusMessage: '',
        status: jest.fn(),
        type: jest.fn(),
        send: jest.fn(),
        end: jest.fn()
    };

    res.status.mockReturnValue(res);
    res.type.mockReturnValue(res);
    res.send.mockReturnValue(res);

    return res;
}

describe('generateRandomString', () => {
    it('produces alphanumeric strings no longer than the requested length', () => {
        for (const length of [ 6, 8, 13 ]) {
            for (let i = 0; i < 50; i++) {
                const value = generateRandomString(length);

                expect(value).toMatch(/^[a-z0-9]*$/);
                expect(value.length).toBeLessThanOrEqual(length);
            }
        }
    });
});

describe('generateExpiresAndExpiresIn', () => {
    it('derives expires from the current time plus the lifetime', () => {
        jest.spyOn(Date, 'now').mockReturnValue(1_000);

        expect(generateExpiresAndExpiresIn(5_000)).toEqual({
            emitted: 1_000,
            expires: 6_000,
            expiresIn: 5_000
        });
    });
});

describe('response helpers', () => {
    it('sendJSON serializes the payload with a trailing newline and json type', () => {
        const res = mockResponse();

        sendJSON(res as unknown as Response, { hello: 'world' });

        expect(res.type).toHaveBeenCalledWith('json');
        expect(res.send).toHaveBeenCalledWith('{"hello":"world"}\n');
    });

    it.each([
        [ send400Error, 400 ],
        [ send401Error, 401 ],
        [ send404Error, 404 ],
        [ send500Error, 500 ]
    ] as const)('%p sets the status code, reason phrase and ends the response', (fn, code) => {
        const res = mockResponse();

        fn(res as unknown as Response, 'boom');

        expect(res.status).toHaveBeenCalledWith(code);
        expect(res.statusMessage).toBe('boom');
        expect(res.end).toHaveBeenCalledTimes(1);
    });
});
