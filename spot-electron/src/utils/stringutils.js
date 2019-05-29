const _ = require('lodash');

/**
 * Returns an array of 2 digit hex numbers as the hex representation of the join code.
 *
 * @param {string} joinCode - A Spot TV join code.
 * @returns {Array<string>}
 */
function joinCodeToVersion(joinCode) {
    const hexValue = parseInt(joinCode, 36).toString(16);

    return _.words(_.padStart(hexValue, 8, '0'), /\w{4,4}/g);
}

module.exports = {
    joinCodeToVersion
};
