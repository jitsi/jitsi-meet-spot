/* global process */

const DEFAULT_DOMAIN = 'alpha.jitsi.net';

/**
 * A version of the configuration with default values set. The dotenv plugin
 * is used here so that during development values can be overridden easily
 * using a .env file.
 */
export default {
    /**
     * Configuration object for referencing external links and applications that
     * provide additional support for Spot.
     */
    ADVERTISEMENT: {

        /**
         * The name of an application that enhances the functionality of Spot.
         *
         * @type {string}
         */
        APP_NAME: process.env.APP_NAME || ''
    },

    /**
     * Configuration objects necessary for client-side calendar integration.
     */
    CALENDARS: {

        BACKEND: {
            SERVICE_URL: process.env.CALENDAR_SERVICE_URL || ''
        },

        /**
         * The configuration specifically for Google Calendar integration.
         */
        GOOGLE: {

            /**
             * The Google application client id to be used for interacting with
             * a Google Calendar. Please see the docs directory for a guide on
             * creating a calendar integration application.
             *
             * @type {string}
             */
            CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
        },

        /**
         * The configuration specifically for Outlook integration.
         */
        OUTLOOK: {

            /**
             * The Microsoft application client id to be used for interacting
             * with an Outlook calendar. Please see the docs directory for a
             * guide on creating a calendar integration application.
             *
             * @type {string}
             */
            CLIENT_ID: process.env.OUTLOOK_CLIENT_ID || ''
        },

        /**
         * How often the calendar service should be checking for calendar updates.
         * A number given in milliseconds.
         *
         * @type {number}
         */
        POLLING_INTERVAL: Number(process.env.CALENDAR_POLLING_INTERVAL) || 60 * 1000,

        /**
         * Tells the app whether or not the push calendar notifications have been enabled on the deployment.
         */
        PUSH_NOTIFICATIONS_ENABLED: process.env.CALENDAR_PUSH_NOTIFICATIONS_ENABLED === 'true'
    },

    /**
     * The avatar image to display in the meetings list when a participant of
     * the meeting has no gravatar configured.
     *
     * @type {string}
     */
    DEFAULT_AVATAR_URL: process.env.DEFAULT_AVATAR_URL
        || `https://${DEFAULT_DOMAIN}/images/avatar.png`,

    /**
     * The app background image to display. By default a solid color is
     * displayed as the background.
     *
     * @type {string}
     */
    DEFAULT_BACKGROUND_IMAGE_URL: process.env.DEFAULT_BACKGROUND_IMAGE_URL
        || '',

    /**
     * The domain to proceed to when a meeting name is submitted without a base
     * url. This value should be set to the domain of a jitsi-meet deployment;
     * for example, set it to "meet.jit.si".
     *
     * @type {string}
     */
    DEFAULT_MEETING_DOMAIN: process.env.DEFAULT_MEETING_DOMAIN || DEFAULT_DOMAIN,

    /**
     * The URL from which to load the Jitsi Meet External API used for
     * interacting with jitsi-meet deployments through an iFrame.
     *
     * @type {string}
     */
    EXTERNAL_API_SRC: process.env.EXTERNAL_API_SRC
        || `https://${DEFAULT_DOMAIN}/external_api.js`,

    /**
     * Configuration object for websites which can be opened from the app.
     */
    EXTERNAL_LINKS: {

        /**
         * The URL which has the privacy policy for the app.
         *
         * @type {string}
         */
        PRIVACY: 'https://www.8x8.com/terms-and-conditions/privacy-policy',

        /**
         * The URL which has the terms and conditions for the app.
         *
         * @type {string}
         */
        TERMS: 'https://www.8x8.com/terms-and-conditions/8x8-end-user-terms-of-use'
    },

    /**
     * Configuration object related to printing, collecting, and reporting of
     * event logs and errors.
     */
    LOGGING: {

        /**
         * The application key provided by a third-party analytics integration
         * to report UI events.
         *
         * @type {string}
         */
        ANALYTICS_APP_KEY: process.env.ANALYTICS_APP_KEY,

        /**
         * The URL to which to post client logs. Currently logging is only
         * implemented to send logs to an endpoint as an array of objects.
         *
         * @type {string}
         */
        ENDPOINT: process.env.LOGGING_ENDPOINT || '',

        /**
         * The application name to provide Jitsi-Meet analytics.
         */
        JITSI_APP_NAME: 'Jitsi Meet Spot Development'
    },

    /**
     * Configuration related to audio/video capturing and playback.
     */
    MEDIA: {

        /**
         * The maximum frames per second the browser should be allowed to
         * capture during wired and wireless screensharing.
         *
         * @type {number}
         */
        SS_MAX_FPS: process.env.SS_MAX_FPS || 60,

        /**
         * The minimum frames per second the browser should capture during
         * wired and wireless screensharing.
         *
         * @type {number}
         */
        SS_MIN_FPS: process.env.SS_MIN_FPS || 5
    },

    /**
     * A list of known domains that can host Jitsi-Meet meetings. Used at least
     * to filter joinable events on the calendar.
     *
     * @type {Array<string>}
     */
    MEETING_DOMAINS_WHITELIST:
        process.env.MEETING_DOMAINS_WHITELIST
            ? process.env.MEETING_DOMAINS_WHITELIST.split(',')
            : [ 'alpha.jitsi.net', 'beta.meet.jit.si', 'meet.jit.si' ],

    /**
     * Configurations for joining meetings from various meeting providers.
     */
    MEETING_INTEGRATIONS: {
        ZOOM: {
            /**
             * The key provided by Zoom when creating an integration client, to
             * be used by the Zoom SDK when joining a meeting.
             */
            API_KEY: process.env.ZOOM_API_KEY,

            /**
             * Zoom meetings require meeting IDs be signed with the api key
             * and api secret. The service does the signing so the client secret
             * can stay out of the client code.
             *
             * Note: for development purposes, Spot's Zoom integration code
             * checks for the environment variable DEV_ONLY_ZOOM_API_SECRET
             * and, if defined, will use that instead to sign the meeting
             * locally with arbitrary api keys. A value must still be assigned
             * to MEETING_SIGN_SERVICE_URL, but it can be any string.
             */
            MEETING_SIGN_SERVICE_URL: process.env.ZOOM_MEETING_SIGN_SERVICE_URL
        }
    },

    /**
     * Domains which Spot can be hosted on which should place Spot into a
     * different UX mode.
     */
    MODE_DOMAINS: {

        /**
         * The domain which should trigger share mode for the Spot-Remote.
         *
         * @type {string}
         */
        SHARE: process.env.SHARE_DOMAIN
    },

    /**
     * The amount of time to wait for a meeting to be joined before assuming it
     * has failed to join.
     *
     * @type {number}
     */
    MEETING_JOIN_TIMEOUT_MS: 120000,

    /**
     * The user-facing name of the Spot app. Configurable in case "Spot" is not
     * the desired name.
     *
     * @type {string}
     */
    PRODUCT_NAME: process.env.PRODUCT_NAME || 'Spot',

    /**
     * The Spot client's version(release tag).
     */
    SPOT_CLIENT_VERSION: process.env.SPOT_CLIENT_VERSION || 'development',

    SPOT_SERVICES: {
        /**
         * A list of known which the JWT, provided by the pairing service,
         * is valid for and should be used with when joining meetings.
         *
         * @type {Array<string>}
         */
        jwtDomains: [],

        /**
         * The backend URL for registering Spot-TV and Spot-Remotes.
         *
         * @type {string}
         */
        pairingServiceUrl: process.env.PAIRING_SERVICE_URL,

        /**
         * The URL pointing to the phone authorize service which checks if
         * calling a phone number is allowed or not.
         *
         * @type {string}
         */
        phoneAuthorizeServiceUrl: process.env.PHONE_AUTHORIZE_SERVICE_URL,

        /**
         * The backend service URL getting conference room information.
         *
         * @type {string}
         */
        roomKeeperServiceUrl: process.env.ROOM_KEEPER_SERVICE_URL
    },

    /**
     * Configurations for services or features in flight so their behavior can
     * be altered through config changes instead of code changes. The flags are
     * intended to be removed once the desired behavior is finalized and ready
     * to use.
     */
    TEMPORARY_FEATURE_FLAGS: {
        /**
         * A temporary workaround to touch tones playing too close to each other
         * and being interpreted as one tone. The value is the minimum pause
         * duration between each tone played. Setting this value to a falsy
         * value will disable throttling. Set to a negative number will disable.
         *
         * @type {number}
         */
        DTMF_THROTTLE_RATE: 500,

        /**
         * When set to true the TV will automatically join a random meeting if a change to video image detected on
         * the screensharing device occurs. In other words joins a meeting if the screensharing device gets connected.
         */
        ENABLE_AUTO_SS_JOIN: process.env.ENABLE_AUTO_SS_JOIN || false,

        /**
         * Whether or the note feature for inviting participants to a conference
         * is available.
         */
        ENABLE_INVITES: false
    },

    /**
     * Configuration object for loading the ultrasound library.
     */
    ULTRASOUND: {

        /**
         * The URL pathname of the quiet-emscripten.js file necessary for
         * lib-quiet-js to process ultrasound.
         *
         * @type {string}
         */
        EMSCRIPTEN_PATH: process.env.ULTRASOUND_EMSCRIPTEN_PATH,

        /**
         * The URL pathname of the quiet-emscriptem.js.mem file used by
         * lib-quiet-js's emscripten.
         *
         * @type {string}
         */
        MEM_INITIALIZER_PATH:
            process.env.ULTRASOUND_MEM_INITIALIZER_PATH,

        /**
         * A string to convert to regex which will be run against the user
         * agent to determine if a Spot-Remote should play ultrasound.
         *
         * @type {string}
         */
        SUPPORTED_ENV_REGEX: process.env.ULTRASOUND_SUPPORT_ENV,

        /**
         * The amount of time in milliseconds to wait until playing an
         * ultrasound message after a message has finished playing.
         *
         * @type {number}
         */
        TRANSMISSION_DELAY: undefined
    },

    UPDATES: {
        START_HOUR: typeof process.env.UPDATE_START_HOUR === 'undefined'
            ? 2
            : process.env.UPDATE_START_HOUR,
        END_HOUR: typeof process.env.UPDATE_END_HOUR === 'undefined'
            ? 4
            : process.env.UPDATE_END_HOUR
    },

    /**
     * This configuration is used to establish a connection with the XMPP
     * service used for jitsi deployments. The service is re-used to support
     * communication between Spot-Remote and Spot-TV instances. More
     * details about what these configuration values mean be found in the
     * lib-jitsi-meet repository, https://github.com/jitsi/lib-jitsi-meet. This
     * configuration is essentially a copy of the configuration already being
     * used by jitsi-meet.
     */
    XMPP_CONFIG: {
        // FIXME adjust default XMPP config, so that PR test are run with websocket
        //  (dedicated env with wss but no JWT is needed)
        bosh: process.env.XMPP_BOSH || `https://${DEFAULT_DOMAIN}/http-bind`,
        hosts: {
            domain: process.env.XMPP_HOSTS_DOMAIN || DEFAULT_DOMAIN,
            muc: process.env.XMPP_HOSTS_MUC_URL || `conference.${DEFAULT_DOMAIN}`
        }
    }
};
