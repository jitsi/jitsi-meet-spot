import merge from 'lodash.merge';

import type { RootState } from '../types';
import defaultConfig from './default-config';
import {
    getJwtDomains,
    getMeetingDomainsWhitelist
} from './selectors';

/**
 * Creates a new config object with the {@code defaultConfig} as a base, with
 * values overridden by the passed in {@code config}.
 *
 * @param config - The config which should override the default config.
 * @returns A new version of {@code defaultConfig} but with overrides
 * set.
 */
export function setDefaultValues(config: any): any {
    const configWithDefaults = merge({}, defaultConfig, config);

    // A synthetic partial state: the config selectors below only read `.config`,
    // and this runs before the real store exists.
    const state = { config: configWithDefaults } as unknown as RootState;
    const configuredWhitelistedDomains = getMeetingDomainsWhitelist(state);
    const configuredJwtDomains = getJwtDomains(state);
    const allWhitelistedDomains = [
        ...configuredWhitelistedDomains,
        ...configuredJwtDomains
    ];
    const allJwtDomains = [
        ...configuredJwtDomains
    ];

    const dedupedWhitelist = Array.from(new Set(allWhitelistedDomains));

    configWithDefaults.MEETING_DOMAINS_WHITELIST = dedupedWhitelist;

    const dedupedJwtDomains = Array.from(new Set(allJwtDomains));

    configWithDefaults.SPOT_SERVICES.jwtDomains = dedupedJwtDomains;

    return configWithDefaults;
}
