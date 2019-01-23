import { Client } from '@microsoft/microsoft-graph-client';
import rs from 'jsrsasign';

import { persistence } from 'utils';

import {
    AUTH_ENDPOINT,
    MS_CONSUMER_TENANT,
    persistenceKeys
} from './constants';

let clientConfig = null;
let popupAuthWindow = null;
let refreshPromise = null;
let signInPromise = null;
let windowCloseCheck = null;

/**
 * Functions for interacting with Outlook and its calendar API.
 */
export default {
    /**
     * Sets a previously loaded access token if available. Caches the config
     * for future use.
     *
     * @param {Object} config - The configuration object to reference when
     * making requests.
     * @param {string} config.clientId - The id of the integration application.
     * @param {string} config.scopes - The API scopes to use for the requests
     * that will be made.
     * @param {string} config.redirectUri - The URI to go to after the
     * integration application has been authorized.
     * @returns {Promise}
     */
    initialize(config) {
        clientConfig = config;

        return Promise.resolve();
    },

    /**
     * Performs an HTTP request to a given endpoint.
     *
     * @param {string} url - The api endpoint.
     * @param {Object} options - Additional details of how the request should
     * be made.
     * @returns {Promise} Resolves when the request completes.
     */
    request(url, options = {}) {
        const ensureLoginPromise = this._isTokenExpired()
            ? Promise.resolve()
            : this._refreshToken();

        return ensureLoginPromise.then(() => {
            const accessToken = persistence.get(persistenceKeys.TOKEN);
            const client = Client.init({
                authProvider: done => done(null, accessToken)
            });
            const apiRequest = client.api(url);

            if (options.version) {
                apiRequest.version(options.version);
            }

            return apiRequest.get();
        });
    },

    /**
     * Display the Microsoft Graph sign in flow.
     *
     * @returns {Promise} Resolves when sign in completes successfully.
     */
    signIn() {
        if (signInPromise && popupAuthWindow) {
            popupAuthWindow.focus();

            return signInPromise;
        }

        const authState = generateGuid();
        const authNonce = generateGuid();

        const authParams = [
            'response_type=id_token+token',
            `client_id=${clientConfig.clientId}`,
            `redirect_uri=${clientConfig.redirectUri}`,
            `scope=${clientConfig.scopes}`,
            `state=${authState}`,
            `nonce=${authNonce}`,
            'response_mode=fragment'
        ].join('&');

        const authUrl = `${AUTH_ENDPOINT}${authParams}`;

        const h = 600;
        const w = 480;

        popupAuthWindow = window.open(
            authUrl,
            'Auth M$',
            `width=${w}, height=${h}, top=${
                (screen.height / 2) - (h / 2)}, left=${
                (screen.width / 2) - (w / 2)}`);

        signInPromise = new Promise((resolve, reject) => {
            /**
             * Callback with scope access to other variables that are part of
             * the sign in request.
             *
             * @param {Object} event - The event from the post message.
             * @private
             * @returns {void}
             */
            function handleAuth({ data }) {
                if (!data || data.type !== 'ms-login') {
                    return;
                }

                window.removeEventListener('message', handleAuth);

                popupAuthWindow && popupAuthWindow.close();

                const params = getParamsFromHash(data.url);
                const tokenParts = getValidatedTokenParts(
                    params,
                    {
                        authState,
                        authNonce
                    },
                    clientConfig.clientId);

                persistence.set(
                    persistenceKeys.TOKEN, tokenParts.accessToken);
                persistence.set(
                    persistenceKeys.DOMAIN, tokenParts.userDomainType);
                persistence.set(
                    persistenceKeys.NAME, tokenParts.userSigninName);
                persistence.set(
                    persistenceKeys.EXPIRY, params.tokenExpireDate);

                signInPromise = null;
                resolve();
            }

            window.addEventListener('message', handleAuth);

            windowCloseCheck = setInterval(() => {
                if (popupAuthWindow && popupAuthWindow.closed) {
                    reject(
                        'Popup closed before completing auth.');
                    popupAuthWindow = null;
                    signInPromise = null;
                    window.removeEventListener('message', handleAuth);
                    clearInterval(windowCloseCheck);
                } else if (!popupAuthWindow) {
                    // This case probably happened because the user completed
                    // auth.
                    clearInterval(windowCloseCheck);
                }
            }, 500);
        });

        return signInPromise;
    },

    /**
     * Checks whether or not the known access token has passed its assumed
     * expiry.
     *
     * @private
     * @returns {boolean}
     */
    _isTokenExpired() {
        const now = new Date().getTime();
        const tokenExpireDate = persistence.get(persistenceKeys.EXPIRY);
        const tokenExpires = parseInt(tokenExpireDate, 10);

        return now < tokenExpires;
    },

    /**
     * Renews the expired access token.
     *
     * @private
     * @returns {Promise}
     */
    _refreshToken() {
        if (refreshPromise) {
            return refreshPromise;
        }

        const authParams = [
            'response_type=id_token+token',
            `client_id=${clientConfig.clientId}`,
            `redirect_uri=${clientConfig.redirectUri}`,
            `scope=${clientConfig.scopes}`,
            'state=undefined',
            'nonce=undefined',
            'response_mode=fragment',
            'prompt=none',
            `domain_hint=${persistence.get(persistenceKeys.DOMAIN)}`,
            `login_hint=${persistence.get(persistenceKeys.NAME)}`
        ].join('&');
        const refreshAuthUrl = `${AUTH_ENDPOINT}${authParams}`;
        const iframe = document.createElement('iframe');

        iframe.setAttribute('id', 'auth-iframe');
        iframe.setAttribute('name', 'auth-iframe');
        iframe.setAttribute('style', 'display: none');
        iframe.setAttribute('src', refreshAuthUrl);

        const iFrameLoadPromise = new Promise(resolve => {
            iframe.onload = () => {
                resolve(iframe.contentWindow.location.href);
                refreshPromise = null;
            };
        });

        document.body.appendChild(iframe);

        refreshPromise = iFrameLoadPromise.then(url => {
            iframe.remove();

            const params = getParamsFromHash(url);

            persistence.set(persistenceKeys.TOKEN, params.access_token);
            persistence.set(
                persistenceKeys.EXPIRY, params.tokenExpireDate);
        });

        return refreshPromise;
    }
};

/**
 * Generate a guid to be used for verifying token validity.
 *
 * @private
 * @returns {string} The generated string.
 */
function generateGuid() {
    const buf = new Uint16Array(8);

    window.crypto.getRandomValues(buf);

    return `${s4(buf[0])}${s4(buf[1])}-${s4(buf[2])}-${s4(buf[3])}-${
        s4(buf[4])}-${s4(buf[5])}${s4(buf[6])}${s4(buf[7])}`;
}

/**
 * Converts a url from an auth redirect into an object of parameters passed
 * into the url.
 *
 * @param {string} url - The string to parse.
 * @private
 * @returns {Object}
 */
function getParamsFromHash(url) {
    const params = {};
    const hashParams = url.split('#/')[1];

    hashParams.split('&').forEach(pair => {
        const [ key, value ] = pair.split('=');

        params[key] = value;
    });

    // Get the number of seconds the token is valid for, subtract 5 minutes
    // to account for differences in clock settings and convert to ms.
    const expiresIn = (parseInt(params.expires_in, 10) - 300) * 1000;
    const now = new Date();
    const tokenExpireDate = new Date(now.getTime() + expiresIn);

    params.tokenExpireDate = tokenExpireDate.getTime().toString();

    return params;
}

/**
 * Converts the parameters from a Microsoft auth redirect into an object of
 * token parts. The value "null" will be returned if the params do not produce
 * a valid token.
 *
 * @param {Object} tokenInfo - The token object.
 * @param {Object} guids - The guids for authState and authNonce that should
 * match in the token.
 * @param {Object} appId - The Microsoft Client ID this token is for.
 * @private
 * @returns {Object|null}
 */
function getValidatedTokenParts(tokenInfo, guids, appId) {
    // Make sure the token matches the request source by matching the GUID.
    if (tokenInfo.state !== guids.authState) {
        return null;
    }

    const idToken = tokenInfo.id_token;

    // A token must exist to be valid.
    if (!idToken) {
        return null;
    }

    const tokenParts = idToken.split('.');

    if (tokenParts.length !== 3) {
        return null;
    }

    const payload
         = rs.KJUR.jws.JWS.readSafeJSONString(rs.b64utoutf8(tokenParts[1]));

    if (payload.nonce !== guids.authNonce
        || payload.aud !== appId
        || payload.iss
            !== `https://login.microsoftonline.com/${payload.tid}/v2.0`) {
        return null;
    }

    const now = new Date();

    // Adjust by 5 minutes to allow for inconsistencies in system clocks.
    const notBefore = new Date((payload.nbf - 300) * 1000);
    const expires = new Date((payload.exp + 300) * 1000);

    if (now < notBefore || now > expires) {
        return null;
    }

    return {
        accessToken: tokenInfo.access_token,
        idToken,
        userDisplayName: payload.name,
        userDomainType:
            payload.tid === MS_CONSUMER_TENANT ? 'consumers' : 'organizations',
        userSigninName: payload.preferred_username
    };
}

/**
 * Converts the passed in number to a string and ensure it is at least 4
 * characters in length, prepending 0's as needed.
 *
 * @param {number} num - The number to pad and convert to a string.
 * @private
 * @returns {string} - The number converted to a string.
 */
function s4(num) {
    let ret = num.toString(16);

    while (ret.length < 4) {
        ret = `0${ret}`;
    }

    return ret;
}
