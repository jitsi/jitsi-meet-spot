const request = require('supertest');

const routes = require('../../common/routes');
const IntegrationsApp = require('../../IntegrationsApp');
const ZoomSigningController = require('../ZoomSigningController');

describe('ZoomSigningController', () => {
    let zoomSigningController;

    let integrationsApp;

    beforeEach(() => {
        zoomSigningController = new ZoomSigningController('api-secret');

        integrationsApp = new IntegrationsApp(
            1135,
            [ zoomSigningController ]
        );
    });

    it('returns 200', () =>
        request(integrationsApp.getServer())
            .post(routes.zoom.sign)
            .send({
                apiKey: 1,
                meetingNumber: 2,
                role: 0
            })
            .expect(200)
            .then(response => expect(response.body.signature).toEqual(expect.any(String)))
    );
});
