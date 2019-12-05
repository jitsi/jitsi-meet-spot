const express = require('express');

const routes = require('../common/routes');

/**
 * Encapsulates interactions with checking if the server is running as expected.
 */
class HealthCheckController {
    /**
     * Instantiates a new instance.
     */
    constructor() {
        // eslint-disable-next-line new-cap
        this.router = express.Router();

        this.router.get(routes.health, this._onHealthCheck);
    }

    /**
     * Responds to indicate the server is running.
     *
     * @param {Request} req - The express request object.
     * @param {Response} res - The express response object.
     * @private
     * @returns {void}
     */
    _onHealthCheck(req, res) {
        res.status(200).send({ status: 'OK' });
    }
}

module.exports = HealthCheckController;
