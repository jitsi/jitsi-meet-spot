const bodyParser = require('body-parser');
const cors = require('cors');
const promBundle = require('express-prom-bundle');

const App = require('./common/App');

/**
 * Provides an HTTP server for requesting information necessary for Spot to
 * interact with meeting service integrations.
 */
class IntegrationsApp extends App {
    /**
     * Initializes middleware and the health check route.
     */
    _beforeInitializeControllers() {
        this._initializeGlobalMiddleware();
        this._initializeHealthCheck();

        // All routes applied after prometheus is installed will automatically
        // be measured. Any routes already declared will be excluded.
        this._initializePrometheusMiddleware();
    }

    /**
     * Starts the health check route.
     *
     * @private
     * @returns {void}
     */
    _initializeHealthCheck() {
        const { healthCheckController } = this._options;

        if (healthCheckController) {
            this._app.use('/', healthCheckController.router);
        }
    }

    /**
     * Applies middleware which should interact with all HTTP requests.
     *
     * @private
     * @returns {void}
     */
    _initializeGlobalMiddleware() {
        this._app.use(bodyParser.json());

        if (this._options.enableCors) {
            this._app.use(cors());
        }
    }

    /**
     * Applies the middleware for gathering metrics for HTTP requests.
     *
     * @private
     * @returns {void}
     */
    _initializePrometheusMiddleware() {
        if (this._options.metricsConfiguration) {
            this._app.use(promBundle(this._options.metricsConfiguration));
        }
    }
}

module.exports = IntegrationsApp;
