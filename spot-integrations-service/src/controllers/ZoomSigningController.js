const base64JS = require('js-base64');
const hmacSha256 = require('crypto-js/hmac-sha256');
const encBase64 = require('crypto-js/enc-base64');
const express = require('express');

const routes = require('../common/routes');

/**
 * Encapsulates interactions necessary to join a Zoom meeting.
 */
class ZoomSigningController {
    /**
     * Instantiates a new instance.
     *
     * @param {string} apiSecret - The Zoom api secret associated with a client
     * integration application.
     */
    constructor(apiSecret) {
        this._apiSecret = apiSecret;

        // eslint-disable-next-line new-cap
        this.router = express.Router();

        this.router.post(routes.zoom.sign, this._onSignMeetingNumber.bind(this));
    }

    /**
     * Encodes a meeting number so the meeting can be joined via a Zoom client.
     * The request body should include
     * {{
     *     apiKey: string,
     *     meetingNumber: string,
     *     role: number
     * }}
     *
     * @param {Request} req - The express request object.
     * @param {Response} res - The express response object.
     * @private
     * @returns {void}
     */
    _onSignMeetingNumber(req, res) {
        const { apiKey, meetingNumber, role } = req.body;

        try {
            const timestamp = new Date().getTime();
            const message = base64JS.Base64.encode(`${apiKey}${meetingNumber}${timestamp}${role}`);
            const hash = hmacSha256(message, this._apiSecret);

            const signature = base64JS.Base64.encodeURI(
                `${apiKey}.${meetingNumber}.${timestamp}.${role}.${encBase64.stringify(hash)}`
            );

            res.status(200).json({ signature });
        } catch (e) {
            console.error('error:', e);

            res.status(500).json({ error: 'generic-error' });
        }
    }
}

module.exports = ZoomSigningController;
