const express = require('express');

const errorHandlingMiddleware = require('../middleware/error');

/**
 * Encapsulates the creation of an HTTP server.
 */
class App {
    /**
     * Instantiates a new instance.
     *
     * @param {number} port - The port number the server should run on.
     * @param {Array<Controllers>} controllers - Controller instances that will
     * handle requests at their own specified routes.
     * @param {Object} options - Additional configuration for how the app should
     * be run.
     */
    constructor(port, controllers, options = {}) {
        this._port = port;
        this._controllers = controllers;
        this._options = options;

        this._app = express();

        this._beforeInitializeControllers();

        this._initializeControllers();

        // Error handling middleware must be applied after all middleware,
        // including those applied by controllers, so it may capture all errors.
        this._app.use(errorHandlingMiddleware);
    }

    /**
     * Returns the underlying HTTP server.
     *
     * @returns {Application}
     */
    getServer() {
        return this._app;
    }

    /**
     * Start listening for HTTP requests.
     *
     * @returns {void}
     */
    start() {
        return new Promise((resolve, reject) => {
            this._app.listen(this._port, resolve)
                .on('error', reject);
        });
    }

    /**
     * Lifecycle method subclasses can use to perform logic before controllers
     * are hooked onto routes.
     *
     * @private
     * @returns {void}
     */
    _beforeInitializeControllers() {
        // To be implemented by subclass.
    }

    /**
     * Sets route handlers.
     *
     * @private
     * @returns {void}
     */
    _initializeControllers() {
        this._controllers.forEach(controller => this._app.use('/', controller.router));
    }
}

module.exports = App;
