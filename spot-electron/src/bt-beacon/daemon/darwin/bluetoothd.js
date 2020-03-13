const beaconEmitter = require('@jitsi/node-ibeacons');

const { logger } = require('../../../logger');

/**
 * Implements a platform specific daemon to interact with the BLE hardware in the computer/device.
 */
class BluetoothD {
    /**
     * Connects to the BT device (opens XPC channel).
     *
     * @returns {Promise<void>}
     */
    connect() {
        beaconEmitter.on('started', () => {
            this.setStatus('started');
            if (typeof this.startResolve === 'function') {
                this.startResolve(true);
                this.startResolve = undefined;
            }
        });

        beaconEmitter.on('stopped', () => {
            this.setStatus('stopped');
        });

        beaconEmitter.on('error', () => {
            this.setStatus('failed');
        });

        return Promise.resolve();
    }

    /**
     * Callback to handle status updates from the device.
     *
     * @param {number} status - The status identifier to set.
     * @returns {void}
     */
    setStatus(status) {
        this.status = status;
        logger.info(`BluetoothD status updated to ${status}`);
    }

    /**
     * Starts the beacon.
     *
     * @param {string} uuid - The uuid of the beacon.
     * @param {string} major - The major version of the beacon in hex.
     * @param {string} minor - The minor version of the beacon in hex.
     * @returns {Promise<boolean>}
     */
    startBeacon(uuid, major = 0, minor = 0) {
        return new Promise(resolve => {
            this.startResolve = resolve;
            beaconEmitter.start(uuid, parseInt(major, 16), parseInt(minor, 16));
        });
    }

    /**
     * Stops the beacon.
     *
     * @returns {Promise<boolean>}
     */
    stopBeacon() {
        beaconEmitter.stop();

        return Promise.resolve(true);
    }

}

module.exports = new BluetoothD();
