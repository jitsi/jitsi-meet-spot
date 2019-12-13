const HttpException = require('../HttpException');

describe('HttpException', () => {
    it('sets the passed in error details', () => {
        const code = 401;
        const message = 'missing authorization';
        const textException = new HttpException(code, message);

        expect(textException.status).toEqual(code);
        expect(textException.message).toEqual(message);
    });
});
