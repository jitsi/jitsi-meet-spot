/* global process */

/**
 * The Google application client id to be used for interacting with a Google
 * calendar.
 */
export const CLIENT_ID = process.env.CLIENT_ID;

/**
 * The avatar image to display in the meetings list when a participant of the
 * meeting has no gravatar configured.
 */
export const DEFAULT_AVATAR_URL
    = process.env.DEFAULT_AVATAR_URL || 'https://meet.jit.si/images/avatar.png';

/**
 * The app background image to display. An empty string will load no background
 * image and instead display a solid color.
 */
export const DEFAULT_BACKGROUND_IMAGE_URL
    = process.env.DEFAULT_BACKGROUND_IMAGE_URL || '';

/**
 * A string of host names, delineated by spaces. The host names are used as
 * a whitelist of which meeting urls can be visited.
 */
export const VALID_MEETING_HOSTS = process.env.VALID_MEETING_HOSTS
    ? process.env.VALID_MEETING_HOSTS.split(' ')
    : [ 'meet.jit.si' ];

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
