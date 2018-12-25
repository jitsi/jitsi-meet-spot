/* global process */

/**
 * The Google application client id to be used for interacting with a Google
 * Calendar.
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
 * The domain to proceed to when a meeting name is submitted with a base url.
 */
export const DEFAULT_MEETING_DOMAIN
    = process.env.DEFAULT_MEETING_DOMAIN || 'meet.jit.si';

/*
 * The Microsoft application client id to be used for interacting with an
 * Outlook calendar.
 */
export const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;

/**
 * This configuration is used to establish a connection with the XMPP service
 * used for jitsi deployments. The service is re-used to support communication
 * between remote controlllers and Spot instances. More details about what these
 * configuration values mean be found in the lib-jitsi-meet repository,
 * https://github.com/jitsi/lib-jitsi-meet. This configuration an essentially
 * copy the configuration already being used by the jitsi UI.
 */
export const XMPP_CONFIG = {
    bosh: process.env.XMPP_BOSH,
    hosts: {
        domain: process.env.XMPP_HOSTS_DOMAIN,
        muc: process.env.XMPP_HOSTS_MUC_URL,
        focus: process.env.XMPP_HOSTS_FOCUS
    }
};
