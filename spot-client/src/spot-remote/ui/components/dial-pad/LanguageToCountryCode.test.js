import { findCountryCodeForLanguage } from './LanguageToCountryCode';

describe('findCountryCodeForLanguage', () => {
    describe.each([
        [ 'en-au', 'AU' ],
        [ 'en-GB', 'GB' ],
        [ 'en-US', 'US' ],
        [ 'pl-PL', 'PL' ],
        [ 'pl', 'PL' ],
        [ 'ro', 'RO' ],
        [ 'ru-mo', 'MO' ],
        [ 'sv-fi', 'FI' ],
        [ 'sv-sv', 'SV' ]
    ])('findCountryCodeForLanguage(%s)', (language, countryCode) => {
        test(`returns ${countryCode}`, () => {
            expect(findCountryCodeForLanguage(language)).toBe(countryCode);
        });
    });
    describe.each([
        'ab',
        'el'
    ])('findCountryCodeForLanguage(%s)', language => {
        test('returns undefined', () => {
            expect(findCountryCodeForLanguage(language)).toBe(undefined);
        });
    });
});
