import merge from 'lodash.merge';

import defaultConfig from './default-config';
import {
    getJwtDomains,
    getMeetingDomainsWhitelist,
    isZoomEnabled
} from './selectors';

/**
 * Creates a new config object with the {@code defaultConfig} as a base, with
 * values overridden by the passed in {@code config}.
 *
 * @param {Object} config - The config which should override the default config.
 * @returns {Object} A new version of {@code defaultConfig} but with overrides
 * set.
 */
export function setDefaultValues(config) {
    const configWithDefaults = merge({}, defaultConfig, config);
    const state = { config: configWithDefaults };
    const configuredWhitelistedDomains = getMeetingDomainsWhitelist(state);
    const configuredJwtDomains = getJwtDomains(state);
    const allWhitelistedDomains = [
        ...configuredWhitelistedDomains,
        ...configuredJwtDomains
    ];
    const allJwtDomains = [
        ...configuredJwtDomains
    ];

    if (isZoomEnabled(state)) {
        allWhitelistedDomains.push('zoom.us');
        allJwtDomains.push('zoom.us');
    }

    const dedupedWhitelist = Array.from(new Set(allWhitelistedDomains));

    configWithDefaults.MEETING_DOMAINS_WHITELIST = dedupedWhitelist;

    const dedupedJwtDomains = Array.from(new Set(allJwtDomains));

    configWithDefaults.SPOT_SERVICES.jwtDomains = dedupedJwtDomains;

    return configWithDefaults;
}
