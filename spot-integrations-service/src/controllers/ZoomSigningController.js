const base64JS = require('js-base64');
const hmacSha256 = require('crypto-js/hmac-sha256');
const encBase64 = require('crypto-js/enc-base64');
const express = require('express');
const validator = require('express-validator');

const routes = require('../common/routes');
const initializeJwtAuthenticationMiddleware = require('../middleware/authentication');

/**
 * Encapsulates interactions necessary to join a Zoom meeting.
 */
class ZoomSigningController {
    /**
     * Instantiates a new instance.
     *
     * @param {ZoomApiSecretRetriever} apiSecretRetriever - An instance of the
     * class ZoomApiSecretRetriever which knows how to retrieve the Zoom api
     * client secret.
     * @param {JwtValidator} jwtValidator - An instance of a JwtValidator
     * to validate JWTs used when making requests to the controller.
     */
    constructor(apiSecretRetriever, jwtValidator) {
        this._apiSecretRetriever = apiSecretRetriever;

        // eslint-disable-next-line new-cap
        this.router = express.Router();

        this.router.post(
            routes.zoom.sign,
            [
                validator.check('apiKey').isString(),
                validator.check('meetingNumber').isString(),
                validator.check('role').isInt(),
                initializeJwtAuthenticationMiddleware(jwtValidator)
            ],
            this._onSignMeetingNumber.bind(this)
        );
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
    async _onSignMeetingNumber(req, res) {
        const errors = validator.validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const { apiKey, meetingNumber, role } = req.body;

            const timestamp = new Date().getTime();
            const message = base64JS.Base64.encode(`${apiKey}${meetingNumber}${timestamp}${role}`);
            const secret = await this._apiSecretRetriever.getSecret();
            const hash = hmacSha256(message, secret);
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
