const envalid = require('envalid');

const HealthCheckController = require('./controllers/HealthCheckController');
const MetricsController = require('./controllers/MetricsController');
const ZoomSigningController = require('./controllers/ZoomSigningController');
const App = require('./common/App');
const JwtValidator = require('./authentication/JwtValidator');
const ZoomApiSecretRetriever = require('./authentication/ZoomApiSecretRetriever');
const IntegrationsApp = require('./IntegrationsApp');

// Validate required environment variables
const environment = envalid.cleanEnv(process.env, {
    API_PORT: envalid.port({ default: 3789 }),
    ASAP_KEY_SERVER: envalid.str(),
    ENABLE_ALL_CORS: envalid.bool({ default: false }),
    METRICS_PORT: envalid.port({ default: 2112 }),
    ZOOM_API_SECRET: envalid.str({ default: '' }),
    ZOOM_AWS_SECRET_NAME: envalid.str({ default: '' }),
    ZOOM_AWS_SECRET_REGION: envalid.str({ default: 'us-west-2' }),
    ZOOM_JWT_CONFIG: envalid.json()
});

const metricsApp = new App(
    environment.METRICS_PORT,
    [
        new MetricsController()
    ]
);
const zoomApiSecretRetriever = new ZoomApiSecretRetriever(
    {
        localApiSecret: environment.ZOOM_API_SECRET,
        region: environment.ZOOM_AWS_SECRET_REGION,
        secretName: environment.ZOOM_AWS_SECRET_NAME
    }
);
const zoomJwtValidator = new JwtValidator(
    environment.ASAP_KEY_SERVER,
    environment.ZOOM_JWT_CONFIG
);
const integrationsApp = new IntegrationsApp(
    environment.API_PORT,
    [
        new ZoomSigningController(zoomApiSecretRetriever, zoomJwtValidator)
    ],
    {
        enableCors: environment.ENABLE_ALL_CORS,
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
    .then(() => zoomApiSecretRetriever.getSecret())
    .then(() => integrationsApp.start())
    .then(() => console.log('app started on ports', environment.API_PORT, environment.METRICS_PORT))
    .catch(error => console.error('App start failed:', error));
