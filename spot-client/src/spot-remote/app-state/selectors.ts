import { getConfiguredMeetingDomain, getSpotTVTenant, type RootState } from 'common/app-state';

/**
 * A selector which returns the last received join code from the external API.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getApiReceivedJoinCode(state: RootState): string {
    return state.spotRemote.apiReceivedJoinCode as string;
}

/**
 * Selects ISO 3166-1 alpha-2 country code for the room's location. It's optionally provided by the backend.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getCountryCode(state: RootState): string | undefined {
    return state.spotRemote.countryCode;
}

/**
 * Selector for the last selected country code. See {@link setMostRecentCountryCode}.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getMostRecentCountryCode(state: RootState): string | undefined {
    return state.spotRemote.mostRecentCountryCode;
}

/**
 * A selector which returns which Jitsi-Meet deployment domain to direct
 * meetings to which do not specify a domain.
 *
 * @param state - The Redux state.
 * @returns
 */
export function getDefaultMeetingDomain(state: RootState): string {
    const domain = getConfiguredMeetingDomain(state);
    const tenant = getSpotTVTenant(state);

    return tenant ? `${domain}/${tenant}` : domain;
}

/**
 * Returns whether or not new user onboarding has been completed.
 *
 * @param state - The Redux state.
 * @returns
 */
export function isOnboardingComplete(state: RootState): boolean {
    return Boolean(state.spotRemote.completedOnboarding);
}
