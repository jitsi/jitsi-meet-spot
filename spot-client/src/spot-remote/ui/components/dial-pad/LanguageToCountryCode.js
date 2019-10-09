import { findCountryInfoByCode } from './countriesInfo';

/**
 * This is a best effort to find a country code for the current browsers language. It's a hit or miss and can often find
 * incorrect match or not find it at all.
 *
 * @param {string} [language] - The browser's language as defined by {@code navigator.language}.
 * @returns {?string}
 */
export function findCountryCodeForLanguage(language) {
    const countryCode = language && language.match('.*-?([a-zA-Z]{2})')[1]?.toUpperCase();

    return findCountryInfoByCode(countryCode) ? countryCode : undefined;
}
