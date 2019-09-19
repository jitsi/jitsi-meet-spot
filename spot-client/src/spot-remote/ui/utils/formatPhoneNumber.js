import { parsePhoneNumberFromString } from 'libphonenumber-js/max';

/**
 * Pretty prints given phone number. Will return a formatted text if a valid phone number string is given.
 *
 * @param {string} [phoneNumber] - A not pretty phone number string, for example: '+12343334444'.
 * @returns {?string}
 */
export function formatPhoneNumber(phoneNumber) {
    return (phoneNumber && parsePhoneNumberFromString(phoneNumber))?.formatInternational();
}
