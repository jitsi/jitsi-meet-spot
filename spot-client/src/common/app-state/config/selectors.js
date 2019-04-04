/**
 * A selector which returns the name of an application to advertise which has
 * integration with Jitsi-Meet-Spot.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getAdvertisementAppName(state) {
    return state.config.ADVERTISEMENT && state.config.ADVERTISEMENT.APP_NAME;
}

/**
 * A selector which returns the configured background image to display.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getBackgroundUrl(state) {
    return state.config.DEFAULT_BACKGROUND_IMAGE_URL;
}

/**
* A selector which returns the configuration objects necessary to initialize
* calendar integrations.
*
* @param {Object} state - The Redux state.
* @returns {Object}
*/
export function getCalendarConfig(state) {
    return state.config.CALENDARS;
}

/**
* A selector which returns the configured default avatar URL to display for
* people without avatar URLs.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getDefaultAvatarUrl(state) {
    return state.config.DEFAULT_AVATAR_URL;
}

/**
* A selector which returns which Jitsi-Meet deployment domain to direct
* meetings to which do not specify a domain.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getDefaultMeetingDomain(state) {
    return state.config.DEFAULT_MEETING_DOMAIN;
}

/**
 * A selector which returns the configuration object for the minimum and
 * maximum framerate to capture for screensharing.
 *
 * @param {Object} state - The Redux state.
 * @returns {Object}
 */
export function getDesktopSharingFramerate(state) {
    return {
        max: state.config.MEDIA.SS_MAX_FPS,
        min: state.config.MEDIA.SS_MIN_FPS
    };
}

/**
 * A selector which returns how often the Spot-TV should change its join code.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getJoinCodeRefreshRate(state) {
    return state.config.JOIN_CODE_REFRESH_RATE
        || 1000 * 60 * 60; // One hour.
}

/**
* A selector which returns a unique id used for identifying the current client
* in logs aggregations.
*
* @param {Object} state - The Redux state.
* @returns {string|undefined}
*/
export function getLoggingEndpoint(state) {
    return state.config.LOGGING.ENDPOINT;
}

/**
* A selector which returns XMPP configuration information for creating XMPP
* connections and joining MUCs.
*
* @param {Object} state - The Redux state.
* @returns {Object}
*/
export function getRemoteControlServerConfig(state) {
    return state.config.XMPP_CONFIG;
}

/**
 * A selector which returns the domain which should trigger the share mode for
 * a Spot-Remote.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getShareDomain(state) {
    return state.config.MODE_DOMAINS.SHARE;
}

/**
 * A selector which returns configuration for Spot related services like the join code service and
 * the admin service URLs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Object}
 */
export function getSpotServicesConfig(state) {
    return state.config.SPOT_SERVICES;
}

/**
* A selector which returns ultrasound configuration for creating loading
* dependencies required by the ultrasound service.
*
* @param {Object} state - The Redux state.
* @returns {Object}
*/
export function getUltrasoundConfig(state) {
    return state.config.ULTRASOUND;
}
