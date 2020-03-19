import _ from 'lodash';

import { Beacon } from './model';

/**
 * Static utility class.
 */
export default class Utils {
    /**
     * Function to compare the results of two separate detection.
     *
     * @param {Array<Beacon>} previousDetection - The list of previously detected devices.
     * @param {Array<Beacon>} newDetection - The list of newly detected devices.
     * @returns {boolean}
     */
    public static isEqual(previousDetection: Beacon[], newDetection: Beacon[]): boolean {
        return _.isEqual(
            _.sortBy(previousDetection, [ 'joinCode' ]),
            _.sortBy(newDetection, [ 'joinCode' ])
        );
    }

    /**
     * Parses the received raw major and minor version of the beacon and returns the
     * join code represented by them.
     *
     * @param major - The major version.
     * @param minor - The minor version.
     * @returns {string}
     */
    public static parseBeaconJoinCode(major = 0, minor = 0): string {
        const segment1 = _.padStart(major.toString(16), 4, '0');
        const segment2 = _.padStart(minor.toString(16), 4, '0');

        return _.padStart(parseInt(`${segment1}${segment2}`, 16).toString(36), 6, '0');
    }
}
