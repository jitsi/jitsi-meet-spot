/**
 * Overrides for the default configuration for Spot. See file default-config.js
 * for all the default values which are used.
 */
window.JitsiMeetSpotConfig = {
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
        APP_NAME: undefined
    },

    /**
     * Configuration objects necessary for client-side calendar integration.
     */
    CALENDARS: {

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
            CLIENT_ID: undefined
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
            CLIENT_ID: undefined
        }
    },

    /**
     * The avatar image to display in the meetings list when a participant of
     * the meeting has no gravatar configured.
     *
     * @type {string}
     */
    DEFAULT_AVATAR_URL: undefined,

    /**
     * The app background image to display. By default a solid color is
     * displayed as the background.
     *
     * @type {string}
     */
    DEFAULT_BACKGROUND_IMAGE_URL: undefined,

    /**
     * The domain to proceed to when a meeting name is submitted without a base
     * url. This value should be set to the domain of a jitsi-meet deployment;
     * for example, set it to "meet.jit.si."
     *
     * @type {string}
     */
    DEFAULT_MEETING_DOMAIN: undefined,

    /**
     * Configuration object related to printing, collecting, and reporting of
     * event logs and errors.
     */
    LOGGING: {

        /**
         * The URL to which to post client logs. Currently logging is only
         * implemented to send logs to an endpoint as an array of objects.
         *
         * @type {string}
         */
        ENDPOINT: undefined
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
        SS_MAX_FPS: undefined,

        /**
         * The minumum frames per second the browser should capture during
         * wired and wireless screensharing.
         *
         * @type {number}
         */
        SS_MIN_FPS: undefined
    },

    /**
     * Domains which Spot can be hosted on which should place Spot into a
     * different UX mode.
     */
    MODE_DOMAINS: {
        /**
         * The domain which should trigger share mode for the Spot-Remote.
         */
        SHARE: undefined
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
        EMSCRIPTEN_PATH: undefined,

        /**
         * The URL pathname of the quiet-emscriptem.js.mem file used by
         * lib-quiet-js's emscripten.
         *
         * @type {string}
         */
        MEM_INITIALIZER_PATH: undefined,

        /**
         * A string to convert to regex which will be run against the user
         * agent to determine if a remote control should play ultrasound.
         *
         * @type {string}
         */
        SUPPORTED_ENV_REGEX: undefined,

        /**
         * The amount of time in milliseconds to wait until playing an
         * ultrasound message after a message has finished playing.
         *
         * @type {number}
         */
        TRANSMISSION_DELAY: undefined
    },

    /**
     * This configuration is used to establish a connection with the XMPP
     * service used for jitsi deployments. The service is re-used to support
     * communication between remote controlllers and Spot instances. More
     * details about what these configuration values mean be found in the
     * lib-jitsi-meet repository, https://github.com/jitsi/lib-jitsi-meet. This
     * configuration an essentially copy the configuration already being used by
     * the jitsi UI.
     */
    XMPP_CONFIG: {
        bosh: undefined,
        hosts: {
            domain: undefined,
            muc: undefined
        }
    }
};
