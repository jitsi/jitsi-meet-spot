/**
 * Generates a random 8 character long string.
 *
 * @returns {string}
 */
export function generate8Characters() {
    const buf = new Uint16Array(2);

    window.crypto.getRandomValues(buf);

    return `${s4(buf[0])}${s4(buf[1])}`;
}

/**
 * Generate a likely-to-be-unique guid.
 *
 * @private
 * @returns {string} The generated string.
 */
export function generateGuid() {
    const buf = new Uint16Array(8);

    window.crypto.getRandomValues(buf);

    return `${s4(buf[0])}${s4(buf[1])}-${s4(buf[2])}-${s4(buf[3])}-${
        s4(buf[4])}-${s4(buf[5])}${s4(buf[6])}${s4(buf[7])}`;
}

/**
 * Converts the passed in number to a string and ensure it is at least 4
 * characters in length, prepending 0's as needed.
 *
 * @param {number} num - The number to pad and convert to a string.
 * @private
 * @returns {string} - The number converted to a string.
 */
function s4(num) {
    let ret = num.toString(16);

    while (ret.length < 4) {
        ret = `0${ret}`;
    }

    return ret;
}
