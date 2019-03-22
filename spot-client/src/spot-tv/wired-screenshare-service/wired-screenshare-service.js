import debounce from 'lodash.debounce';

import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';
import { avUtils } from 'common/media';

import VideoChangeListener from './video-change-listener';

/**
 * Encapsulates interacting with the wired screensharing feature.
 */
export class WiredScreenshareService {
    /**
     * Initializes a new {@code WiredScreenshareService} instance.
     */
    constructor() {
        /**
         * A mapping of device labels to VideoChangeLister instances.
         */
        this._videoChangeListeners = new Map();

        this._deviceListChangeListeners = new Set();

        this._videoInputDevices = null;

        this._onDeviceListChange = debounce(
            this._onDeviceListChange.bind(this),
            500
        );

        avUtils.listenForDeviceListChanged(this._onDeviceListChange);
    }

    /**
     * Factory function to create an instance of {@code VideoChangeListener}.
     *
     * @param {string} deviceLabel - The device label associated with the
     * screensharing device.
     * @param {number} initialFrameValue - Optional value indicating the idle
     * frame from which to detect screenshare changes.
     * @returns {VideoChangeListener}
     */
    getVideoChangeListener(deviceLabel, initialFrameValue) {
        return new VideoChangeListener(deviceLabel, initialFrameValue);
    }

    /**
     * Returns all connected video input devices.
     *
     * @returns {Array<Object>}
     */
    getVideoInputDevices() {
        if (this._videoInputDevices) {
            return Promise.resolve(this._videoInputDevices);
        }

        // TODO: check if permission is already provided and avoid calling gum
        // if possible.
        return avUtils.createLocalVideoTrack()
            .then(track => track.dispose())
            .then(() => avUtils.enumerateDevices())
            .then(deviceList => {
                const videoInputDevices
                    = this._filterForVideoInputs(deviceList);

                this._videoInputDevices = videoInputDevices;

                return videoInputDevices;
            });
    }

    /**
     * Registers a callback to be notified when a screensharing device,
     * specified by label, has detected a device being connected to it or
     * disconnected from it.
     *
     * @param {string} deviceLabel - The device label associated with the
     * screensharing device.
     * @param {Function} callback - The callback which should be notified when
     * a connection change has been detected.
     * @param {number} initialFrameValue - Optional value indicating the idle
     * frame from which to detect screenshare changes.
     * @returns {Promise}
     */
    startListeningForConnection(deviceLabel, callback, initialFrameValue) {
        if (!deviceLabel) {
            logger.warn('Attempted to start listening for screenshare '
                + 'connection without a device label set up.');

            return;
        }

        let videoChangeListener;

        if (this._videoChangeListeners.has(deviceLabel)) {
            videoChangeListener = this._videoChangeListeners.get(deviceLabel);
        } else {
            videoChangeListener
                = this.getVideoChangeListener(deviceLabel, initialFrameValue);

            this._videoChangeListeners.set(deviceLabel, videoChangeListener);
        }

        videoChangeListener.addChangeListener(callback);

        videoChangeListener.start();
    }

    /**
     * Removes a callback from receiving updates about a screensharing input.
     * Will clean up the screensharing input listener if there are no callbacks
     * actively listening for change.
     *
     * @param {string} deviceLabel - The device label associated with the
     * screensharing device.
     * @param {Function} callback - The callback which was registered to be
     * notified when a connection change has been detected.
     * @returns {Promise}
     */
    stopListeningForConnection(deviceLabel, callback) {
        const videoChangeListener = this._videoChangeListeners.get(deviceLabel);

        if (!videoChangeListener) {
            return;
        }

        videoChangeListener.removeChangeListener(callback);

        if (!videoChangeListener.hasActiveListeners()) {
            videoChangeListener.destroy();
            this._videoChangeListeners.delete(deviceLabel);
        }
    }

    /**
     * Be notified when a new camera device has been connected or disconnected.
     *
     * @param {Function} callback - The function to invoke on camera change.
     * @private
     * @returns {void}
     */
    startListeningForDeviceChange(callback) {
        this._deviceListChangeListeners.add(callback);
    }

    /**
     * Stop being notified when a new camera device has been connected or
     * disconnected.
     *
     * @param {Function} callback - The function which should not longer be
     * called.
     * @private
     * @returns {void}
     */
    stopListeningForDeviceChange(callback) {
        this._deviceListChangeListeners.delete(callback);
    }

    /**
     * Gets all camera sources from the return value of enumerateDevices.
     *
     * @param {Array<Object>} deviceList - All camera, mic, and speaker devices
     * accessible through WebRTC.
     * @private
     * @returns {Array<Object>} The deviecs with everything but cameras filtered
     * out.
     */
    _filterForVideoInputs(deviceList) {
        return deviceList.filter(device => device.kind === 'videoinput');
    }

    /**
     * Callback invoked when the list of known media devices has changed.
     * Notifies any registered listeners of the change.
     *
     * @param {Array<Object>} deviceList - Descriptions of the media devices,
     * as provided by WebRTC.
     * @private
     * @returns {void}
     */
    _onDeviceListChange(deviceList) {
        const videoInputDevices = this._filterForVideoInputs(deviceList);

        if (!videoInputDevices.length) {
            logger.warn('Received device list change with no cameras');

            return;
        }

        if (!videoInputDevices.some(device => Boolean(device.label))) {
            logger.warn(
                'Received device list change but maybe no video permission');

            return;
        }

        this._videoInputDevices = videoInputDevices;

        this._deviceListChangeListeners.forEach(
            callback => callback(this._videoInputDevices));
    }
}

const wiredScreenshareService = new WiredScreenshareService();

globalDebugger.register('wiredScreenshareService', wiredScreenshareService);

export default wiredScreenshareService;
