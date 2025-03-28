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
 * A selector which returns the application key to use when connecting to the
 * analytics service.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getAnalyticsAppKey(state) {
    return state.config.LOGGING.ANALYTICS_APP_KEY;
}

/**
 * A selector which returns the application name for Jitsi-Meet to use for its
 * analytics logging.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getJitsiAppName(state) {
    return state.config.LOGGING.JITSI_APP_NAME;
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
* A selector which returns which Jitsi-Meet deployment domain to direct
* meetings to which do not specify a domain.
*
* @param {Object} state - The Redux state.
* @returns {string}
*/
export function getConfiguredMeetingDomain(state) {
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
 * A selector which returns the pause interval between playing DTMF.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getDtmfThrottleRate(state) {
    return state.config.TEMPORARY_FEATURE_FLAGS.DTMF_THROTTLE_RATE;
}

/**
 * A selector which returns the URL for loading the Jitsi Meet External Api.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getExternalApiUrl(state) {
    return state.config.EXTERNAL_API_SRC;
}

/**
 * A selector which returns the URL for loading lib-jitsi-meet.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getLjmUrl(state) {
    return state.config.LJM_SRC;
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
 * A selector which returns domains for which the backend-provided JWT is valid.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>}
 */
export function getJwtDomains(state) {
    return state.config.SPOT_SERVICES.jwtDomains;
}

/**
 * A boolean selector to know on meeting end if remotes should be kick out or not.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function getKickTemporaryRemotesOnMeetingEnd(state) {
    return state.config.KICK_TEMPORARY_REMOTES_ON_MEETING_END;
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
 * A selector which gets how long the remote should wait for a meeting to be
 * joined before showing an option to cancel the join.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getMeetingCancelTimeout(state) {
    return state.config.MEETING_CANCEL_TIMEOUT_MS;
}

/**
 * A selector which gets the list of meeting domains that are known to support
 * meetings on Jitsi-Meet deployments.
 *
 * @param {Object} state - The Redux state.
 * @returns {string[]}
 */
export function getMeetingDomainsWhitelist(state) {
    return state.config.MEETING_DOMAINS_WHITELIST;
}

/**
 * A selector which gets how long the app should wait before automatically
 * returning home if a meeting join verification has not been received.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getMeetingJoinTimeout(state) {
    return state.config.MEETING_JOIN_TIMEOUT_MS;
}

/**
 * A selector which returns the URL for the privacy policy of the app.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getPrivacyPolicyURL(state) {
    return state.config.EXTERNAL_LINKS.PRIVACY;
}

/**
 * A selector which returns the configured name of Spot.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getProductName(state) {
    return state.config.PRODUCT_NAME;
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
 * Returns the current version of this Spot client build.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getSpotClientVersion(state) {
    return state.config.SPOT_CLIENT_VERSION;
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
 * A selector which returns the URL for the terms and conditions of the app.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getTermsAndConditionsURL(state) {
    return state.config.EXTERNAL_LINKS.TERMS;
}

/**
 * A selector which returns the WIDTH for changing the film strip width.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getFilmStripThresholdWidth(state) {
    return state.config.FILMSTRIP_SIZE.THRESHOLD_WIDTH;
}

/**
 * A selector which returns the ASPECT_RATIO of width and height for starting to change the film strip width.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getClientAspectRatio(state) {
    return state.config.FILMSTRIP_SIZE.ASPECT_RATIO;
}

/**
 * A selector which returns the ASPECT_RATIO_SPLIT between client width and film strip width.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getFilmStripAspectRatioSplit(state) {
    return state.config.FILMSTRIP_SIZE.ASPECT_RATIO_SPLIT;
}

/**
 * A selector which returns the starting hour in the day when the app may reload
 * itself to get updates.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getUpdateStartHour(state) {
    return state.config.UPDATES.START_HOUR;
}

/**
 * A selector which returns the ending hour in the day when the app may no
 * longer reload itself to get updates.
 *
 * @param {Object} state - The Redux state.
 * @returns {number}
 */
export function getUpdateEndHour(state) {
    return state.config.UPDATES.END_HOUR;
}

/**
 * A selector which tells the app whether or not the calendar push notifications are enabled on the current deployment.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isCalendarPushEnabled(state) {
    return state.config.CALENDARS.PUSH_NOTIFICATIONS_ENABLED;
}

/**
 * A selector which returns whether or not a random meeting will be automatically joined as soon as
 * there's a video change detected in the wired screensharing device.
 *
 * @param {Object} state - The Redux state.
 * @returns {boolean}
 */
export function isScreensharingAutoJoinEnabled(state) {
    return state.config.TEMPORARY_FEATURE_FLAGS.ENABLE_AUTO_SS_JOIN;
}
