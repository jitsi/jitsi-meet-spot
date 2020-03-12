const AdvertisementAPI = require('@jitsi/windows.devices.bluetooth.advertisement');
const StreamsAPI = require('@jitsi/windows.storage.streams');

const { logger } = require('../../../logger');

/**
 * Status mapping for the raw status of the device.
 */
const HW_STATUSES = {
    0: 'created',
    1: 'waiting',
    2: 'started',
    3: 'stopping',
    4: 'stopped',
    5: 'aborted'
};

/**
 * Implements a platform specific daemon to interact with the BLE hardware in the computer/device.
 */
class BluetoothD {

    /**
     * Connects to the BT device.
     *
     * @returns {Promise<void>}
     */
    connect() {
        this.advertiser = new AdvertisementAPI.BluetoothLEAdvertisementPublisher();

        this.advertiser.on('StatusChanged', ({ status }) => {
            this.status = status;
            if (this.advertisingStatusUpdatedCallback === 'function') {
                this.advertisingStatusUpdatedCallback(status === 2);
                this.advertisingStatusUpdatedCallback = undefined;
            }
            logger.info(`BluetoothD advertising: ${HW_STATUSES[status]}`);
        });

        return Promise.resolve();
    }

    /**
     * Starts the beacon.
     *
     * @param {string} uuid - The uuid of the beacon.
     * @param {string} major - The major version of the beacon in hex.
     * @param {string} minor - The minor version of the beacon in hex.
     * @returns {Promise<boolean>}
     */
    async startBeacon(uuid, major = 0, minor = 0) {
        if (this.status === 2) {
            throw new Error('Beacon is already running');
        }

        const uuidHex = uuid.replace(/-/g, '');
        const majorHex = major.padStart(4, '0');
        const minorHex = minor.padStart(4, '0');

        const manuDataWriter = new StreamsAPI.DataWriter();
        const manuDataValue = `0215${uuidHex}${majorHex}${minorHex}c5`.split('');

        for (let i = 0; i < manuDataValue.length; i += 2) {
            manuDataWriter.writeByte(parseInt(`${manuDataValue[i]}${manuDataValue[i + 1]}`, 16));
        }

        const manuData = new AdvertisementAPI.BluetoothLEManufacturerData();

        manuData.companyId = 0x004C;
        manuData.data = manuDataWriter.detachBuffer();
        this.advertiser.advertisement.manufacturerData.clear();
        this.advertiser.advertisement.manufacturerData.append(manuData);
        this.advertiser.start();

        return true;
    }

    /**
     * Stops the beacon.
     *
     * @returns {Promise<boolean>}
     */
    stopBeacon() {
        if (this.status !== 2) {
            return Promise.resolve(false);
        }

        // If we're in started state, we need to invoke stop and then
        // only resolve the promise (with the new state) when the hardware
        // sends us a new state. Any state other than started is ok for us.
        return new Promise(resolve => {
            this.advertisingStatusUpdatedCallback = resolve;
            this.advertiser.stop();
        });
    }
}

module.exports = new BluetoothD();
