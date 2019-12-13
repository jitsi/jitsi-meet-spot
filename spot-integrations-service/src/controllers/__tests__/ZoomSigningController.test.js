const request = require('supertest');

const routes = require('../../common/routes');
const IntegrationsApp = require('../../IntegrationsApp');
const ZoomSigningController = require('../ZoomSigningController');

describe('ZoomSigningController', () => {
    let integrationsApp;

    let mockJwtValidator;

    let zoomSigningController;

    beforeEach(() => {
        mockJwtValidator = {
            isValidJwt: jest.fn().mockReturnValue(Promise.resolve())
        };

        zoomSigningController = new ZoomSigningController('api-secret', mockJwtValidator);

        integrationsApp = new IntegrationsApp(
            1135,
            [ zoomSigningController ]
        );
    });

    it('returns 200', () =>
        request(integrationsApp.getServer())
            .post(routes.zoom.sign)
            .set('Authorization', 'Bearer any-jwt')
            .send({
                apiKey: '11',
                meetingNumber: '223',
                role: 0
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => expect(response.body.signature).toEqual(expect.any(String)))
    );

    describe('request validation', () => {
        it('errors when a required value is missing', () =>
            request(integrationsApp.getServer())
                .post(routes.zoom.sign)
                .set('Authorization', 'Bearer any-jwt')
                .send({})
                .expect(422)
        );

        it('errors when an invalid type value is sent', () =>
            request(integrationsApp.getServer())
                .post(routes.zoom.sign)
                .set('Authorization', 'Bearer any-jwt')
                .send({
                    apiKey: '11',
                    meetingNumber: {},
                    role: 0
                })
                .expect(422)
        );
    });
});
