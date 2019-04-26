/**
 * The URL to use when authenticating using Microsoft API.
 */
export const AUTH_ENDPOINT
    = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?';

/* eslint-disable max-len */
/**
 * This value is needed for passing in the proper domain_hint value when trying
 * to refresh a token silently. See:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-implicit-grant-flow#send-the-sign-in-request
 */
/* eslint-enable max-len */
export const MS_CONSUMER_TENANT = '9188040d-6c67-4c5b-b112-36a304b66dad';

/**
 * Keys for persisted data that must be stored and queried for authentication.
 */
export const persistenceKeys = {
    DOMAIN: 'msUserDomainType',
    NAME: 'msUserSigninName',
    TOKEN: 'msAccessToken',
    EXPIRY: 'msAccessTokenExpireDate'
};
