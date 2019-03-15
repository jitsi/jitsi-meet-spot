import merge from 'lodash.merge';

import defaultConfig from './default-config';

/**
 * Creates a new config object with the {@code defaultConfig} as a base, with
 * values overridden by the passed in {@code config}.
 *
 * @param {Object} config - The config which should override the default config.
 * @returns {Object} A new version of {@code defaultConfig} but with overrides
 * set.
 */
export function setDefaultValues(config) {
    return merge({}, defaultConfig, config);
}
