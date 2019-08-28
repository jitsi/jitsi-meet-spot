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
