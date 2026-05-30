import type { Response } from 'express';

import type { ExpiresInfo } from '../types.js';

/**
 * Serializes an object as JSON and writes it to the response, matching the
 * trailing-newline behavior the real backend uses.
 *
 * @param response - The Express response.
 * @param object - The payload to serialize.
 */
export function sendJSON(response: Response, object: unknown): void {
    response.type('json');
    response.send(`${JSON.stringify(object)}\n`);
}

/**
 * Ends the response with the given HTTP status code and reason phrase.
 *
 * @param res - The Express response.
 * @param status - The HTTP status code.
 * @param error - The reason phrase.
 */
function sendError(res: Response, status: number, error: string): void {
    res.status(status);
    res.statusMessage = error;
    res.end();
}

/**
 * Ends the response with a 400 Bad Request.
 *
 * @param res - The Express response.
 * @param error - The reason phrase.
 */
export function send400Error(res: Response, error: string): void {
    sendError(res, 400, error);
}

/**
 * Ends the response with a 401 Unauthorized.
 *
 * @param res - The Express response.
 * @param error - The reason phrase.
 */
export function send401Error(res: Response, error: string): void {
    sendError(res, 401, error);
}

/**
 * Ends the response with a 404 Not Found.
 *
 * @param res - The Express response.
 * @param error - The reason phrase.
 */
export function send404Error(res: Response, error: string): void {
    sendError(res, 404, error);
}

/**
 * Ends the response with a 500 Internal Server Error.
 *
 * @param res - The Express response.
 * @param error - The reason phrase.
 */
export function send500Error(res: Response, error: string): void {
    sendError(res, 500, error);
}

/**
 * Generates a short random alphanumeric string.
 *
 * @param length - The desired length (clamped to the original implementation's bounds).
 * @returns The random string.
 */
export function generateRandomString(length = 13): string {
    return Math.random().toString(36).substring(2, Math.max(Math.min(2 + length, 15), 3));
}

/**
 * Builds the timing metadata shared by tokens and pairing codes.
 *
 * @param expiresIn - The lifetime in millis.
 * @returns The timing metadata.
 */
export function generateExpiresAndExpiresIn(expiresIn: number): ExpiresInfo {
    const emitted = Date.now();

    return {
        emitted,
        expires: emitted + expiresIn,
        expiresIn
    };
}
