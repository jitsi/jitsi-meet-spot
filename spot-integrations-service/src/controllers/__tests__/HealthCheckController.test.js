const request = require('supertest');

const routes = require('../../common/routes');
const IntegrationsApp = require('../../IntegrationsApp');
const HealthCheckController = require('../HealthCheckController');

describe('HealthCheckController', () => {
    let healthCheckController;

    let integrationsApp;

    beforeEach(() => {
        healthCheckController = new HealthCheckController();

        integrationsApp = new IntegrationsApp(
            1135,
            [],
            {
                healthCheckController
            }
        );
    });

    it('returns 200', () =>
        request(integrationsApp.getServer())
            .get(routes.health)
            .expect(200)
            .then(response => expect(response.body.status).toBe('OK'))
    );
});
