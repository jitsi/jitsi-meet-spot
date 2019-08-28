import { getConfiguredMeetingDomain, getTenant } from 'common/app-state';

/**
 * A selector which returns which Jitsi-Meet deployment domain to direct
 * meetings to which do not specify a domain.
 *
 * @param {Object} state - The Redux state.
 * @returns {string}
 */
export function getDefaultMeetingDomain(state) {
    const domain = getConfiguredMeetingDomain(state);
    const tenant = getTenant(state);

    return tenant ? `${domain}/${tenant}` : domain;
}
