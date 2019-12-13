const envalid = require('envalid');

const HealthCheckController = require('./controllers/HealthCheckController');
const MetricsController = require('./controllers/MetricsController');
const ZoomSigningController = require('./controllers/ZoomSigningController');
const App = require('./common/App');
const JwtValidator = require('./authentication/JwtValidator');
const IntegrationsApp = require('./IntegrationsApp');

// Validate required environment variables
envalid.cleanEnv(process.env, {
    API_PORT: envalid.num(),
    ASAP_KEY_SERVER: envalid.str(),
    METRICS_PORT: envalid.num(),
    ZOOM_API_SECRET: envalid.str(),
    ZOOM_JWT_CONFIG: envalid.json()
});

const metricsApp = new App(
    process.env.METRICS_PORT,
    [
        new MetricsController()
    ]
);
const zoomJwtValidator = new JwtValidator(
    process.env.ASAP_KEY_SERVER,
    JSON.parse(process.env.ZOOM_JWT_CONFIG)
);
const integrationsApp = new IntegrationsApp(
    process.env.API_PORT,
    [
        new ZoomSigningController(process.env.ZOOM_API_SECRET, zoomJwtValidator)
    ],
    {
        enableCors: process.env.ENABLE_ALL_CORS,
        healthCheckController: new HealthCheckController(),
        metricsConfiguration: {
            autoregister: false, // Will manually register /metrics in separate app
            buckets: [ 0.001, 0.01, 0.1, 0.5, 1.0, 2.0 ],
            includeMethod: false,
            includePath: false,
            promClient: {
                collectDefaultMetrics: true
            }
        }
    }
);

metricsApp.start()
    .then(() => integrationsApp.start())
    .then(() => console.log('app started on ports', process.env.API_PORT, process.env.METRICS_PORT))
    .catch(error => console.error('App start failed:', error));
