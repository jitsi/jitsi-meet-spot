const express = require('express');
const promClient = require('prom-client');

const routes = require('../common/routes');

/**
 * Encapsulates interactions with fetching metrics.
 */
class MetricsController {
    /**
     * Instantiates a new instance.
     */
    constructor() {
        // eslint-disable-next-line new-cap
        this.router = express.Router();

        this.router.post(routes.metrics, this._onGetMetrics);
    }

    /**
     * Responds to request for metrics by providing stats stored by prometheus
     * metrics.
     *
     * @param {Request} req - The express request object.
     * @param {Response} res - The express response object.
     * @private
     * @returns {void}
     */
    _onGetMetrics(req, res) {
        res.set('Content-Type', promClient.register.contentType);
        res.end(promClient.register.metrics());
    }
}

module.exports = MetricsController;
