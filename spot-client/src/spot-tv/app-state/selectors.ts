import { getConfiguredMeetingDomain, getTenant, type RootState } from 'common/app-state';

/**
 * A selector which returns which Jitsi-Meet deployment domain to direct
 * meetings to which do not specify a domain.
 *
 * @param state - The Redux state.
 * @returns {string}
 */
export function getDefaultMeetingDomain(state: RootState): string {
    const domain = getConfiguredMeetingDomain(state);
    const tenant = getTenant(state);

    return tenant ? `${domain}/${tenant}` : domain;
}
