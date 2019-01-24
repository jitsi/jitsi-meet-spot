/**
 * A {@code Reducer} to update the current Redux state for the known global
 * configuration. This is a stub as the configuration is set through a global.
 *
 * @param {Object} state - The current Redux state for the 'setup' feature.
 * @returns {Object}
 */
const config = (state = {}) => state;

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
 * A selector which returns XMPP configuration information for creating XMPP
 * connections and joining MUCs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Object}
 */
export function getRemoteControlServerConfig(state) {
    return state.config.XMPP_CONFIG;
}

export default config;
