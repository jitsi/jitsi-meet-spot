export const errorConstants = {
    /**
     * Thrown during connecting process if for any reason there is no access token in the registration object.
     * This is most likely a bug in the code and should not be handled.
     */
    NO_JWT: 'no-jwt',

    /**
     * When backend receives an error response from which there is no recovery.
     */
    REQUEST_FAILED: 'request-failed'
};
