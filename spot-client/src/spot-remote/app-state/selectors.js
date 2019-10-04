import { getConfiguredMeetingDomain, getSpotTVTenant } from 'common/app-state';

/**
 * A selector which returns the last received join code from the external API.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getApiReceivedJoinCode(state) {
    return state.spotRemote.apiReceivedJoinCode;
}

/**
 * Selects ISO 3166-1 alpha-2 country code for the room's location. It's optionally provided by the backend.
 *
 * @param {Object} state - The Redux state.
 * @returns {?string}
 */
export function getCountryCode(state) {
    return state.spotRemote.countryCode;
}

/**
 * Selector for the last selected country code. See {@link setMostRecentCountryCode}.
 *
 * @param {Object} state - The Redux state.
 * @returns {?string}
 */
export function getMostRecentCountryCode(state) {
    return state.spotRemote.mostRecentCountryCode;
}

/**
 * A selector which returns which Jitsi-Meet deployment domain to direct
 * meetings to which do not specify a domain.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getDefaultMeetingDomain(state) {
    const domain = getConfiguredMeetingDomain(state);
    const tenant = getSpotTVTenant(state);

    return tenant ? `${domain}/${tenant}` : domain;
}

/**
 * Returns whether or not new user onboarding has been completed.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function isOnboardingComplete(state) {
    return Boolean(state.spotRemote.completedOnboarding);
}
