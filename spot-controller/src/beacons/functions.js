import _ from 'lodash';

/**
 * Converts an UUID to an integer to be used as a numeric ID.
 *
 * @param {string} uuid - The string UUID to convert.
 * @returns {number}
 */
export function getIntegerUuid(uuid = '') {
    return parseInt(uuid.replace(/\W/g, ''), 16);
}

/**
 * Compares two list of detected beacons and returns true if they are equal.
 *
 * @param {Array<Object>} previousDetection - The previously detected list of beaconos.
 * @param {Array<Object>} newDetection - The newly detected list of beaconos.
 * @returns {boolean}
 */
export function isEqual(previousDetection, newDetection) {
    return _.isEqual(
        _.sortBy(previousDetection, [ 'joinCode' ]),
        _.sortBy(newDetection, [ 'joinCode' ])
    );
}

/**
 * Parses the major and minor version of the beacon and returns the join code.
 *
 * @param {number} major - The major version of the beacon.
 * @param {*} minor - The minor version of the beacon.
 * @returns {string}
 */
export function parseBeaconJoinCode(major = 0, minor = 0) {
    const segment1 = major.toString(16).padStart(4, '0');
    const segment2 = minor.toString(16).padStart(4, '0');

    return parseInt(`${segment1}${segment2}`, 16).toString(36);
}
