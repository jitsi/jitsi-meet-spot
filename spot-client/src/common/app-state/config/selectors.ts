/**
 * A selector which returns the name of an application to advertise which has
 * integration with Jitsi-Meet-Spot.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getAdvertisementAppName(state: any) {
    return state.config.ADVERTISEMENT && state.config.ADVERTISEMENT.APP_NAME;
}

/**
 * A selector which returns the application key to use when connecting to the
 * analytics service.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getAnalyticsAppKey(state: any) {
    return state.config.LOGGING.ANALYTICS_APP_KEY;
}

/**
 * A selector which returns the application name for Jitsi-Meet to use for its
 * analytics logging.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getJitsiAppName(state: any) {
    return state.config.LOGGING.JITSI_APP_NAME;
}

/**
 * A selector which returns the configured background image to display.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getBackgroundUrl(state: any) {
    return state.config.DEFAULT_BACKGROUND_IMAGE_URL;
}

/**
* A selector which returns the configuration objects necessary to initialize
* calendar integrations.
*
* @param state - The Redux state.
* @returns
*/
export function getCalendarConfig(state: any) {
    return state.config.CALENDARS;
}

/**
* A selector which returns which Jitsi-Meet deployment domain to direct
* meetings to which do not specify a domain.
*
* @param state - The Redux state.
* @returns
*/
export function getConfiguredMeetingDomain(state: any) {
    return state.config.DEFAULT_MEETING_DOMAIN;
}

/**
 * A selector which returns the configuration object for the minimum and
 * maximum framerate to capture for screensharing.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getDesktopSharingFramerate(state: any) {
    return {
        max: state.config.MEDIA.SS_MAX_FPS,
        min: state.config.MEDIA.SS_MIN_FPS
    };
}

/**
 * A selector which returns the pause interval between playing DTMF.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getDtmfThrottleRate(state: any) {
    return state.config.TEMPORARY_FEATURE_FLAGS.DTMF_THROTTLE_RATE;
}

/**
 * A selector which returns the URL for loading the Jitsi Meet External Api.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getExternalApiUrl(state: any) {
    return state.config.EXTERNAL_API_SRC;
}

/**
 * A selector which returns the URL for loading lib-jitsi-meet.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getLjmUrl(state: any) {
    return state.config.LJM_SRC;
}

/**
 * A selector which returns how often the Spot-TV should change its join code.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getJoinCodeRefreshRate(state: any) {
    return state.config.JOIN_CODE_REFRESH_RATE
        || 1000 * 60 * 60; // One hour.
}

/**
 * A selector which returns domains for which the backend-provided JWT is valid.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getJwtDomains(state: any) {
    return state.config.SPOT_SERVICES.jwtDomains;
}

/**
 * A boolean selector to know on meeting end if remotes should be kick out or not.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getKickTemporaryRemotesOnMeetingEnd(state: any) {
    return state.config.KICK_TEMPORARY_REMOTES_ON_MEETING_END;
}

/**
* A selector which returns a unique id used for identifying the current client
* in logs aggregations.
*
* @param state - The Redux state.
* @returns
*/
export function getLoggingEndpoint(state: any) {
    return state.config.LOGGING.ENDPOINT;
}

/**
 * A selector which gets how long the remote should wait for a meeting to be
 * joined before showing an option to cancel the join.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getMeetingCancelTimeout(state: any) {
    return state.config.MEETING_CANCEL_TIMEOUT_MS;
}

/**
 * A selector which gets the list of meeting domains that are known to support
 * meetings on Jitsi-Meet deployments.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getMeetingDomainsWhitelist(state: any) {
    return state.config.MEETING_DOMAINS_WHITELIST;
}

/**
 * A selector which gets how long the app should wait before automatically
 * returning home if a meeting join verification has not been received.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getMeetingJoinTimeout(state: any) {
    return state.config.MEETING_JOIN_TIMEOUT_MS;
}

/**
 * A selector which returns the URL for the privacy policy of the app.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getPrivacyPolicyURL(state: any) {
    return state.config.EXTERNAL_LINKS.PRIVACY;
}

/**
 * A selector which returns the configured name of Spot.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getProductName(state: any) {
    return state.config.PRODUCT_NAME;
}

/**
* A selector which returns XMPP configuration information for creating XMPP
* connections and joining MUCs.
*
* @param state - The Redux state.
* @returns
*/
export function getRemoteControlServerConfig(state: any) {
    return state.config.XMPP_CONFIG;
}

/**
 * A selector which returns the domain which should trigger the share mode for
 * a Spot-Remote.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getShareDomain(state: any) {
    return state.config.MODE_DOMAINS.SHARE;
}

/**
 * Returns the current version of this Spot client build.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getSpotClientVersion(state: any) {
    return state.config.SPOT_CLIENT_VERSION;
}

/**
 * A selector which returns configuration for Spot related services like the join code service and
 * the admin service URLs.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getSpotServicesConfig(state: any) {
    return state.config.SPOT_SERVICES;
}


/**
 * A selector which returns the URL for the terms and conditions of the app.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getTermsAndConditionsURL(state: any) {
    return state.config.EXTERNAL_LINKS.TERMS;
}

/**
 * A selector which returns the WIDTH for changing the film strip width.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getFilmStripThresholdWidth(state: any) {
    return state.config.FILMSTRIP_SIZE.THRESHOLD_WIDTH;
}

/**
 * A selector which returns the ASPECT_RATIO of width and height for starting to change the film strip width.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getClientAspectRatio(state: any) {
    return state.config.FILMSTRIP_SIZE.ASPECT_RATIO;
}

/**
 * A selector which returns the ASPECT_RATIO_SPLIT between client width and film strip width.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getFilmStripAspectRatioSplit(state: any) {
    return state.config.FILMSTRIP_SIZE.ASPECT_RATIO_SPLIT;
}

/**
 * A selector which returns the starting hour in the day when the app may reload
 * itself to get updates.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getUpdateStartHour(state: any) {
    return state.config.UPDATES.START_HOUR;
}

/**
 * A selector which returns the ending hour in the day when the app may no
 * longer reload itself to get updates.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getUpdateEndHour(state: any) {
    return state.config.UPDATES.END_HOUR;
}

/**
 * A selector which tells the app whether or not the calendar push notifications are enabled on the current deployment.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isCalendarPushEnabled(state: any) {
    return state.config.CALENDARS.PUSH_NOTIFICATIONS_ENABLED;
}

/**
 * A selector which returns whether or not a random meeting will be automatically joined as soon as
 * there's a video change detected in the wired screensharing device.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isScreensharingAutoJoinEnabled(state: any) {
    return state.config.TEMPORARY_FEATURE_FLAGS.ENABLE_AUTO_SS_JOIN;
}
