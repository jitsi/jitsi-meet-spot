const httpMocks = require('node-mocks-http');

const initializeJwtAuthenticationMiddleware = require('../authentication');
const HttpException = require('../../exceptions/HttpException');

describe('authentication', () => {
    let authenticationMiddleware;

    let mockNext;

    let mockJwtValidator;

    beforeEach(() => {
        mockNext = jest.fn();
        mockJwtValidator = {
            isValidJwt: jest.fn().mockReturnValue(Promise.resolve())
        };

        authenticationMiddleware = initializeJwtAuthenticationMiddleware(mockJwtValidator);
    });

    it('with a valid JWT, calls next without error', async () => {
        const request = httpMocks.createRequest({
            headers: {
                Authorization: 'Bearer any-jwt'
            }
        });

        await authenticationMiddleware(request, jest.fn(), mockNext);

        expect(mockNext).toHaveBeenCalledWith();
    });

    it('with no Authorization specified returns a 401', async () => {
        const request = httpMocks.createRequest({
            headers: {}
        });

        await authenticationMiddleware(request, jest.fn(), mockNext);

        const reportedError = mockNext.mock.calls[0][0];

        expect(reportedError instanceof HttpException).toEqual(true);
        expect(reportedError.status).toEqual(401);
        expect(reportedError.message).toEqual('no authorization specified');
    });

    it('with potentially no token specified returns a 401', async () => {
        const request = httpMocks.createRequest({
            headers: {
                Authorization: 'any-jwt-no-prefix'
            }
        });

        await authenticationMiddleware(request, jest.fn(), mockNext);

        const reportedError = mockNext.mock.calls[0][0];

        expect(reportedError instanceof HttpException).toEqual(true);
        expect(reportedError.status).toEqual(401);
        expect(reportedError.message).toEqual('improper authorization format');
    });

    it('with invalid JWT returns a 401', async () => {
        const jwtErrorReason = 'not a good jwt';
        const request = httpMocks.createRequest({
            headers: {
                Authorization: 'Bearer any-jwt'
            }
        });

        jest.spyOn(mockJwtValidator, 'isValidJwt').mockReturnValue(Promise.reject(new Error(jwtErrorReason)));

        await authenticationMiddleware(request, jest.fn(), mockNext);

        const reportedError = mockNext.mock.calls[0][0];

        expect(reportedError instanceof HttpException).toEqual(true);
        expect(reportedError.status).toEqual(401);
        expect(reportedError.message).toEqual(jwtErrorReason);
    });
});
