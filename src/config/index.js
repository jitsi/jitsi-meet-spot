/* global process */

/**
 * The Google application client id to be used for interacting with a Google
 * calendar.
 */
export const CLIENT_ID = process.env.CLIENT_ID;

/**
 * This configuration is used to establish a connection with the XMPP service
 * used for jitsi conferences. The service is re-used to support communication
 * between the remote control and main application window. More details about
 * what these configuration values mean be found in the lib-jitsi-meet
 * repository, https://github.com/jitsi/lib-jitsi-meet. This configuration
 * can essentially copy the configuration already being used by the jitsi
 * conference UI.
 */
export const XMPP_CONFIG = {
    bosh: process.env.XMPP_BOSH,
    hosts: {
        domain: process.env.XMPP_HOSTS_DOMAIN,
        muc: process.env.XMPP_HOSTS_MUC_URL,
        focus: process.env.XMPP_HOSTS_FOCUS
    }
};
