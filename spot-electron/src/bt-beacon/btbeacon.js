const { config } = require('../config');

const { clientController } = require('../client-control');
const { logger } = require('../logger');
const { joinCodeToVersion } = require('../utils');

const daemon = require('./daemon');

/**
 * Represents a soft-beacon emulated by the computer running Spot TV
 */
class BTBeacon {

    /**
     * Instantiates a new instance of the class.
     */
    constructor() {
        this.region = config.getValue('beacon.region');

        if (daemon && this.region) {
            daemon.connect().then(() => {
                clientController.on('updateJoinCode', ({ joinCode }) => {
                    this.joinCodeUpdated(joinCode);
                });
            });
        } else {
            logger.warn('BT beacon functionality is not available.');
        }
    }

    /**
     * Updates the beacon to emit the newly received join code.
     *
     * @param {string} joinCode - The join code to use as major and minor version for the beacon.
     * @returns {void}
     */
    joinCodeUpdated(joinCode) {
        if (this.joinCode === joinCode) {
            return;
        }

        logger.info('Updating BT beacon...');
        if (joinCode) {
            const majorMinorVersion = joinCodeToVersion(joinCode);

            daemon.stopBeacon().then(() => {
                daemon.startBeacon(this.region, majorMinorVersion[0], majorMinorVersion[1]).then(() => {
                    this.joinCode = joinCode;
                    logger.info(`BT Beacon updated with join code ${joinCode}`);
                });
            });
        } else {
            // No join code, we disable the beacon.
            daemon.stopBeacon().then(() => {
                logger.info('BT beacon stoppped.');
            });
        }
    }
}

module.exports = new BTBeacon();
