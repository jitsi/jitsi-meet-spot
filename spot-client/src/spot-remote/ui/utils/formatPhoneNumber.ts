import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Pretty prints given phone number. Will return a formatted text if a valid phone number string is given.
 *
 * @param phoneNumber - A not pretty phone number string, for example: '+12343334444'.
 * @returns
 */
export function formatPhoneNumber(phoneNumber?: string): string | undefined {
    if (!phoneNumber) {
        return undefined;
    }

    return parsePhoneNumberFromString(phoneNumber)?.formatInternational();
}
