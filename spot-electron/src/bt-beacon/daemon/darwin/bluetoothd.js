const XpcConnection = require('xpc-connect');

const { logger } = require('../../../logger');

const DEVICE_STATES = [ 'Unknown', 'Resetting', 'Unsupported', 'Unauthorized', 'Powered Off', 'Powered On' ];

/**
 * Implements a platform specific daemon to interact with the BLE hardware in the computer/device.
 */
class BluetoothD {
    advertisingStatusUpdatedCallback;

    /**
     * Instantiates a new instance.
     */
    constructor() {
        this.xpcConnection = new XpcConnection('com.apple.bluetoothd');

        this.xpcConnection.on('error', message => {
            logger.error('XpcError', message);
        });

        this.xpcConnection.on('event', event => {
            const messageArguments = event.kCBMsgArgs;

            switch (event.kCBMsgId) {
            case 4:
                // Device status update
                this.setStatus(messageArguments.kCBMsgArgState);
                break;
            case 28:
                // Beacon activation result
                this.setAdvertisingStatus(!messageArguments.kCBMsgArgResult);
                break;
            case 29:
                // Beacon deactivation result
                this.setAdvertisingStatus(Boolean(messageArguments.kCBMsgArgResult));
                break;
            case 38:
                // Device ready
                this.readyPromise && this.readyPromise();
                break;
            case 67:
                // Connection request. We don't need this.
                break;
            default:
                logger.warn('Unknown XpcEvent', event);
            }
        });
    }

    /**
     * Connects to the BT device (opens XPC channel).
     *
     * @returns {Promise<void>}
     */
    connect() {
        return new Promise(resolve => {
            this.readyPromise = resolve;
            this.xpcConnection.setup();
            this.sendMessage(1, {
                kCBMsgArgName: `jitsi-bt-beacon-${(new Date()).getTime()}`,
                kCBMsgArgOptions: {
                    kCBInitOptionShowPowerAlert: 1
                },
                kCBMsgArgType: 1,
                kCBMsgArgVersion: 20161219
            });
        });
    }

    /**
     * Sends a message to the BT device.
     *
     * @param {number} id - The message ID to send.
     * @param {Object} args - The message args to send.
     * @returns {void}
     */
    sendMessage(id, args) {
        const message = {
            kCBMsgId: id
        };

        if (args) {
            message.kCBMsgArgs = args;
        }
        this.xpcConnection.sendMessage(message);
    }

    /**
     * Updates the advertising status of the device.
     *
     * @param {boolean} status - The status to set.
     * @returns {void}
     */
    setAdvertisingStatus(status) {
        this.advertisingStatus = status;
        logger.info('BluetoothD advertising', this.advertisingStatus ? 'started' : 'stopped');
        if (typeof this.advertisingStatusUpdatedCallback === 'function') {
            this.advertisingStatusUpdatedCallback(status);
            this.advertisingStatusUpdatedCallback = undefined;
        }
    }

    /**
     * Callback to handle status updates from the device.
     *
     * @param {number} status - The status identifier to set.
     * @returns {void}
     */
    setStatus(status) {
        this.status = DEVICE_STATES[status];
        logger.info('BluetoothD status updated to', this.status);
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
        return new Promise((resolve, reject) => {
            if (this.advertisingStatus) {
                reject('Beacon is already running');
            }
            this.advertisingStatusUpdatedCallback = resolve;
            const uuidHex = uuid.replace(/-/g, '');
            const majorHex = major.padStart(4, '0');
            const minorHex = minor.padStart(4, '0');
            const beaconKey = `${uuidHex}${majorHex}${minorHex}c5`;

            this.sendMessage(17, {
                kCBAdvDataAppleBeaconKey: Buffer.from(beaconKey, 'hex')
            });
        });
    }

    /**
     * Stops the beacon.
     *
     * @returns {Promise<boolean>}
     */
    stopBeacon() {
        return new Promise(resolve => {
            if (this.advertisingStatus) {
                this.advertisingStatusUpdatedCallback = resolve;
                this.sendMessage(18, undefined);
            } else {
                resolve(false);
            }
        });
    }

}

module.exports = new BluetoothD();
