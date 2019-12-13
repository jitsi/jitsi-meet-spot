const JwtValidator = require('../JwtValidator');

describe('JwtValidatorTests', () => {
    const jwtOptions = {
        audiences: [ 'SPOT-AUD' ],
        issuers: [ 'SPOT-ISS' ]
    };

    let jwtValidator;

    beforeEach(() => {
        jwtValidator = new JwtValidator('http://fake.server', jwtOptions);
    });

    describe('getJwtValidationError', () => {
        const validPayload = {
            aud: jwtOptions.audiences,
            iss: jwtOptions.issuers
        };

        it('with no issuer returns an error', () => {
            const payload = {
                ...validPayload,
                iss: undefined
            };

            expect(jwtValidator.getJwtValidationError(payload)).toBe('no issuer');
        });

        it('with no matching issuer returns an error', () => {
            const payload = {
                ...validPayload,
                iss: [ 'NOT-SPOT-ISS' ]
            };

            expect(jwtValidator.getJwtValidationError(payload)).toBe('invalid issuer');
        });

        it('with no audience returns an error', () => {
            const payload = {
                ...validPayload,
                aud: undefined
            };

            expect(jwtValidator.getJwtValidationError(payload)).toBe('no audience');
        });

        it('with no matching audience returns an error', () => {
            const payload = {
                ...validPayload,
                aud: [ 'NOT-SPOT-AUD' ]
            };

            expect(jwtValidator.getJwtValidationError(payload)).toBe('invalid audience');
        });

        it('returns no error if the jwt is valid', () => {
            expect(jwtValidator.getJwtValidationError(validPayload)).toBe(undefined);
        });

        it('accepts issues as a string', () => {
            const payload = {
                ...validPayload,
                iss: `ANY,OTHER,${jwtOptions.issuers[0]},ANOTHER`
            };

            expect(jwtValidator.getJwtValidationError(payload)).toBe(undefined);
        });

        it('accepts audience as a string', () => {
            const payload = {
                ...validPayload,
                aud: `ANY,OTHER,${jwtOptions.audiences[0]},ANOTHER`
            };

            expect(jwtValidator.getJwtValidationError(payload)).toBe(undefined);
        });
    });
});
