const AWS = require('aws-sdk');

/**
 * Encapsulates fetching the Zoom api client secret from AWS. This default
 * behavior can be overridden by passing in an api secret.
 */
class ZoomApiSecretRetriever {
    /**
     * Instantiates a new instance.
     *
     * @param {Object} options - Configuration for the instance.
     * @param {string} [options.localApiSecret] - A client secret to return
     * instead of fetching from AWS.
     * @param {string} region - The AWS region in which the secret is saved.
     * @param {string} secretName - The name of the secret in AWS Secrets Manager.
     */
    constructor(options = {}) {
        if (options.localApiSecret) {
            this._localApiSecret = options.localApiSecret;
        }

        this.secretName = options.secretName;
        this.client = new AWS.SecretsManager({
            region: options.region
        });
    }

    /**
     * Fetches the secret and caches it.
     *
     * @returns {Promise} Resolves with a string that is the client secret.
     */
    getSecret() {
        if (this._localApiSecret) {
            return Promise.resolve(this._localApiSecret);
        }

        if (this._cachedSecret) {
            return Promise.resolve(this._cachedSecret);
        }

        const getPromise = new Promise((resolve, reject) => {
            this.client.getSecretValue({ SecretId: this.secretName }, (err, data) => {
                if (err) {
                    reject(err);

                    return;
                }

                resolve(data);
            });
        });

        return getPromise
            .then(data => {
                let secretString;

                if ('SecretString' in data) {
                    secretString = data.SecretString;
                } else {
                    const buff = new Buffer(data.SecretBinary, 'base64');

                    secretString = buff.toString('ascii');
                }

                const secretInfo = JSON.parse(secretString);

                if (!secretInfo.ZOOM_API_SECRET) {
                    return Promise.reject('no zoom api secret found');
                }

                this._cachedSecret = secretInfo.ZOOM_API_SECRET;

                return this._cachedSecret;
            });
    }
}

module.exports = ZoomApiSecretRetriever;
