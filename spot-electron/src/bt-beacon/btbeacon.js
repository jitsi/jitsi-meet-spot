const { config } = require('../config');

const { clientController } = require('../client-control');
const { logger } = require('../logger');
const { joinCodeToVersion } = require('../utils');
const os = require('os');

const platform = os.platform();
const daemon = require('./daemon');

/**
 * Represents a soft-beacon emulated by the computer running Spot TV.
 */
class BTBeacon {
    remoteJoinCode;

    /**
     * Instantiates a new instance of the class.
     */
    constructor() {
        this.region = config.getValue('beacon.region');
        const isWin = platform === 'win32';

        if (!isWin && daemon && this.region) {
            logger.info('Starting beacon service...');
            daemon.connect().then(() => {
                logger.info('Beacon service connected');
                clientController.on('updateJoinCode', ({ remoteJoinCode }) => {
                    this.joinCodeUpdated(remoteJoinCode);
                });
            });
        } else {
            logger.warn('BT beacon functionality is not available.');
        }
    }

    /**
     * Updates the beacon to emit the newly received join code.
     *
     * @param {string} remoteJoinCode - The join code to use as major and minor version for the beacon.
     * @returns {void}
     */
    joinCodeUpdated(remoteJoinCode) {
        if (this.remoteJoinCode === remoteJoinCode) {
            return;
        }

        logger.info('Updating BT beacon...');
        if (remoteJoinCode) {
            const majorMinorVersion = joinCodeToVersion(remoteJoinCode);

            daemon.stopBeacon().then(() => {
                daemon.startBeacon(this.region, majorMinorVersion[0], majorMinorVersion[1]).then(() => {
                    this.remoteJoinCode = remoteJoinCode;
                    logger.info(`BT Beacon updated with join code ${remoteJoinCode}`);
                });
            });
        } else {
            // No join code, we disable the beacon.
            daemon.stopBeacon().then(() => {
                logger.info('BT beacon stopped.');
            });
        }
    }
}

module.exports = new BTBeacon();
