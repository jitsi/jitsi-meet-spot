
import { logger } from 'common/logger';
import { JitsiMeetJSProvider } from 'common/vendor';

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
        const JitsiMeetJS = JitsiMeetJSProvider.get();

        // TODO: check if permission is already provided and avoid calling gum
        // if possible.
        return JitsiMeetJS.createLocalTracks({ devices: [ 'video' ] })
            .then(tracks => tracks.forEach(track => track.dispose()))
            .then(() => new Promise(
                resolve => JitsiMeetJS.mediaDevices.enumerateDevices(resolve)
            ))
            .then(devices => {
                const cameras
                    = devices.filter(device => device.kind === 'videoinput');

                return cameras;
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
}

export default new WiredScreenshareService();
