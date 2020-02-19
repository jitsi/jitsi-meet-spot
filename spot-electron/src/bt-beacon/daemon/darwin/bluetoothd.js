const os = require('os');
const XpcConnection = require('xpc-connect');

const { logger } = require('../../../logger');

const osRelease = parseInt(os.release(), 10);
const DEVICE_STATES = [ 'Unknown', 'Resetting', 'Unsupported', 'Unauthorized', 'Powered Off', 'Powered On' ];

let deviceCommands;

logger.log(`Launching BT beacon for os release ${osRelease}`);

switch (osRelease) {
case 19:
    deviceCommands = require('./commands.catalina');
    break;
default:
    deviceCommands = require('./commands.mojave');
}

!deviceCommands && logger.warn('BT beacon is not supported on this os release');

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
            logger.error('XpcError', { message });
        });

        this.xpcConnection.on('event', event => {
            const messageArguments = event.kCBMsgArgs;

            switch (event.kCBMsgId) {
            case deviceCommands.statusUpdate:
                // Device status update
                this.setStatus(messageArguments.kCBMsgArgState);
                break;
            case deviceCommands.beaconActivated:
                // Beacon activation result
                this.setAdvertisingStatus(!messageArguments.kCBMsgArgResult);
                break;
            case deviceCommands.beaconDeactivated:
                // Beacon deactivation result
                this.setAdvertisingStatus(Boolean(messageArguments.kCBMsgArgResult));
                break;
            case deviceCommands.ready:
                // Device ready
                this.readyPromise && this.readyPromise();
                break;
            case deviceCommands.connectionRequest:
                // Connection request. We don't need this.
                break;
            default:
                logger.warn('Unknown XpcEvent', { event });
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
            this.sendMessage(deviceCommands.initializeDevice, {
                kCBMsgArgName: `jitsi-bt-beacon-${Date.now()}`,
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
        logger.info(`BluetoothD advertising: ${this.advertisingStatus}`);
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
        logger.info(`BluetoothD status updated to ${status} (${this.status || 'unknown'})`);
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

            this.sendMessage(deviceCommands.activateBeacon, {
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
                this.sendMessage(deviceCommands.deactivateBeacon, undefined);
            } else {
                resolve(false);
            }
        });
    }

}

module.exports = new BluetoothD();
