import _ from 'lodash';
import osascript from 'node-osascript';
import os from 'node:os';

import { clientController } from '../client-control/index.js';
import { logger } from '../logger/index.js';

const VOLUME_STEP = 5;

/**
 * Implements a system volume control routine that can control the volume of several host OSes.
 */
class VolumeControl {
    private _platform: string;

    /**
     * Instantiates a new control.
     *
     * @param platform - One of the values node.os.platform() may return.
     */
    constructor(platform: string) {
        this._platform = _.capitalize(platform);
    }

    /**
     * Decreases the volume by {@code VOLUME_STEP} percent.
     *
     * @returns {void}
     */
    decreaseVolume(): void {
        this._adjustVolume(VOLUME_STEP * -1);
    }

    /**
     * Increases the volume by {@code VOLUME_STEP} percent.
     *
     * @returns {void}
     */
    increaseVolume(): void {
        this._adjustVolume(VOLUME_STEP);
    }

    /**
     * Adjusts the volume by a percent value.
     *
     * @param percentage - The value.
     * @returns {void}
     */
    private _adjustVolume(percentage: number): void {
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
    private _getVolume(): Promise<number> {
        switch (this._platform) {
        case 'Darwin':
            return this._getDarwinVolume();
        case 'Win32':
            return this._getWin32Volume();
        default:
            return Promise.reject(new Error(`Unsupported platform: ${this._platform}`));
        }
    }

    /**
     * Sets the current volume.
     *
     * @param value - The new volume level in [0..100].
     * @returns {Promise<void>}
     */
    private _setVolume(value: number): Promise<void> {
        switch (this._platform) {
        case 'Darwin':
            return this._setDarwinVolume(value);
        case 'Win32':
            return this._setWin32Volume(value);
        default:
            return Promise.reject(new Error(`Unsupported platform: ${this._platform}`));
        }
    }

    /* Platform specific functions */

    /**
     * _getVolume for mac.
     *
     * @returns {Promise<number>}
     */
    private _getDarwinVolume(): Promise<number> {
        return new Promise((resolve, reject) => {
            osascript.execute('output volume of (get volume settings)', (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result as number);
                }
            });
        });
    }

    /**
     * _getVolume for Windows.
     *
     * @returns {Promise<number>}
     */
    private async _getWin32Volume(): Promise<number> {
        const { speaker } = await import('win-audio');

        return speaker.get();
    }

    /**
     * _setVolume for mac.
     *
     * @param value - The new volume level in [0..100].
     * @returns {Promise<void>}
     */
    private _setDarwinVolume(value: number): Promise<void> {
        return new Promise((resolve, reject) => {
            osascript.execute(`set volume output volume ${value}`, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * _setVolume for Windows.
     *
     * @param value - The new volume level in [0..100].
     * @returns {Promise<void>}
     */
    private async _setWin32Volume(value: number): Promise<void> {
        const { speaker } = await import('win-audio');

        speaker.set(value);
    }
}

const volumeControl = new VolumeControl(os.platform());

clientController.on('adjustVolume', ({ direction }: { direction: string; }) => {
    logger.info(`Adjusting volume level ${direction}`);

    switch (direction) {
    case 'up':
        volumeControl.increaseVolume();
        break;
    case 'down':
        volumeControl.decreaseVolume();
    }
});

export default volumeControl;
