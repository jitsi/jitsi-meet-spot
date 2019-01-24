/* global process */

/**
 * FIXME: I wanted to keep the local environment file to place overrides for
 * development while also making the config dynamically loadable. The only way
 * I could find to do this reliably was by placing the config on a global...
 */
window.JitsiMeetSpotConfig = {
    /**
     * The avatar image to display in the meetings list when a participant of
     * the meeting has no gravatar configured.
     */
    DEFAULT_AVATAR_URL: process.env.DEFAULT_AVATAR_URL
        || 'https://meet.jit.si/images/avatar.png',

    /**
     * The app background image to display. An empty string will load no
     * background image and instead display a solid color.
     */
    DEFAULT_BACKGROUND_IMAGE_URL: process.env.DEFAULT_BACKGROUND_IMAGE_URL
        || '',

    /**
     * The domain to proceed to when a meeting name is submitted with a base
     * url.
     */
    DEFAULT_MEETING_DOMAIN: process.env.DEFAULT_MEETING_DOMAIN || 'meet.jit.si',

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
             * a Google Calendar.
             */
            CLIENT_ID: process.env.GOOGLE_CLIENT_ID || ''
        },

        /**
         * The configuration specifically for Outlook integration.
         */
        OUTLOOK: {

            /*
             * The Microsoft application client id to be used for interacting
             * with an Outlook calendar.
             */
            CLIENT_ID: process.env.OUTLOOK_CLIENT_ID || ''
        }
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
        bosh: process.env.XMPP_BOSH || '',
        hosts: {
            domain: process.env.XMPP_HOSTS_DOMAIN || '',
            focus: process.env.XMPP_HOSTS_FOCUS || '',
            muc: process.env.XMPP_HOSTS_MUC_URL || ''
        }
    }
};
