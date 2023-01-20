const _ = require('lodash');
const osascript = require('node-osascript');
const os = require('os');

const { clientController } = require('../client-control');
const { logger } = require('../logger');

const VOLUME_STEP = 5;

/**
 * Implements a system volume control routine that can control the volume of several host OSes.
 */
class VolumeControl {
    _platform;

    /**
     * Instantiates a new control.
     *
     * @param {string} platform - One of the values node.os.platform() may return.
     */
    constructor(platform) {
        this._platform = _.capitalize(platform);
    }

    /**
     * Decreases the volume by {@code VOLUME_STEP} percent.
     *
     * @returns {void}
     */
    decreaseVolume() {
        this._adjustVolume(VOLUME_STEP * -1);
    }

    /**
     * Increases the volume by {@code VOLUME_STEP} percent.
     *
     * @returns {void}
     */
    increaseVolume() {
        this._adjustVolume(VOLUME_STEP);
    }

    /**
     * Adjusts the volume by a percent value.
     *
     * @param {number} percentage - The value.
     * @returns {void}
     */
    _adjustVolume(percentage) {
        this._getVolume().then(value => {
            const newVolume = Math.max(0, Math.min(100, value + percentage));

            this._setVolume(newVolume).then(() => {
                logger.info(`Volume adjusted to ${newVolume}`);
            });
        });
    }

    /**
     * Gets the current volume in [0..100].
     *
     * @returns {Promise<number>}
     */
    _getVolume() {
        const functionName = `_get${this._platform}Volume`;

        return (this[functionName] && this[functionName]()) || Promise.reject();
    }

    /**
     * Sets the current volume.
     *
     * @param {number} value - The new volume level in [0..100].
     * @returns {Promise<void>}
     */
    _setVolume(value) {
        const functionName = `_set${this._platform}Volume`;

        return (this[functionName] && this[functionName](value)) || Promise.reject();
    }

    /* Platform specific functions */

    /**
     * _getVolume for mac.
     *
     * @returns {Promise<number>}
     */
    _getDarwinVolume() {
        return new Promise((resolve, reject) => {
            osascript.execute('output volume of (get volume settings)', (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * _getVolume for Windows.
     *
     * @returns {Promise<number>}
     */
    _getWin32Volume() {
        const { speaker } = require('win-audio');

        return new Promise(resolve => resolve(speaker.get()));
    }

    /**
     * _setVolume for mac.
     *
     * @param {number} value - The new volume level in [0..100].
     * @returns {Promise<void>}
     */
    _setDarwinVolume(value) {
        return new Promise((resolve, reject) => {
            osascript.execute(`set volume output volume ${value}`, error => {
                (error && reject(error)) || resolve();
            });
        });
    }

    /**
     * _setVolume for Windows.
     *
     * @param {number} value - The new volume level in [0..100].
     * @returns {Promise<void>}
     */
    _setWin32Volume(value) {
        const { speaker } = require('win-audio');

        speaker.set(value);

        return Promise.resolve();
    }
}

const volumeControl = new VolumeControl(os.platform());

clientController.on('adjustVolume', ({ direction }) => {
    logger.info(`Adjusting volume level ${direction}`);

    switch (direction) {
    case 'up':
        volumeControl.increaseVolume();
        break;
    case 'down':
        volumeControl.decreaseVolume();
    }
});

module.exports = volumeControl;
