const ZoomApiSecretRetriever = require('../ZoomApiSecretRetriever');
const aws = require('aws-sdk-mock');

describe('ZoomApiSecretRetriever', () => {
    let zoomApiSecretRetriever;

    describe('getSecret with a local secret', () => {
        const localSecret = 'a-local-secret';

        beforeEach(() => {
            zoomApiSecretRetriever = new ZoomApiSecretRetriever({
                localApiSecret: localSecret
            });
        });

        it('uses the cached secret', () =>
            zoomApiSecretRetriever.getSecret()
                .then(secret => {
                    expect(secret).toEqual(localSecret);
                })
        );
    });

    describe('getSecret without a local secret', () => {
        const remoteSecret = 'secret-in-secrets-manager';

        beforeEach(() => {
            aws.mock('SecretsManager', 'getSecretValue', {
                SecretString: JSON.stringify({ ZOOM_API_SECRET: remoteSecret })
            });

            zoomApiSecretRetriever = new ZoomApiSecretRetriever({
                secretName: 'AWS_SECRET_NAME'
            });
        });

        it('returns the fetched secret', () =>
            zoomApiSecretRetriever.getSecret()
                .then(secret => {
                    expect(secret).toEqual(remoteSecret);
                })
        );
    });
});
