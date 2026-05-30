import { findCountryInfoByCode } from './countriesInfo';

/**
 * This is a best effort to find a country code for the current browsers language. It's a hit or miss and can often find
 * incorrect match or not find it at all.
 *
 * @param language - The browser's language as defined by {@code navigator.language}.
 * @returns
 */
export function findCountryCodeForLanguage(language?: string): string | undefined {
    const countryCode = language && language.match('.*-?([a-zA-Z]{2})')?.[1]?.toUpperCase();

    return countryCode && findCountryInfoByCode(countryCode) ? countryCode : undefined;
}
