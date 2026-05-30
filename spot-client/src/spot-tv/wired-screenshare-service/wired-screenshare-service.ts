import { globalDebugger } from 'common/debugging';
import { logger } from 'common/logger';

import VideoChangeListener from './video-change-listener';

/**
 * Encapsulates detection of when screensharing devices have significant change
 * to their video feeds, which may be caused by a device being plugged into
 * them.
 */
export class WiredScreenshareService {
    private _videoChangeListeners: Map<string, any>;

    /**
     * Initializes a new {@code WiredScreenshareService} instance.
     */
    constructor() {
        /**
         * A mapping of device labels to {@code VideoChangeLister} instances.
         */
        this._videoChangeListeners = new Map();
    }

    /**
     * Factory function to create an instance of {@code VideoChangeListener}.
     *
     * @param deviceLabel - The device label associated with the
     * screensharing device.
     * @param initialFrameValue - Optional value indicating the idle
     * frame from which to detect screenshare changes.
     * @returns {VideoChangeListener}
     */
    getVideoChangeListener(deviceLabel: string, initialFrameValue?: number): any {
        return new VideoChangeListener(deviceLabel, initialFrameValue);
    }

    /**
     * Registers a callback to be notified when a screensharing device,
     * specified by label, has detected a device being connected to it or
     * disconnected from it.
     *
     * @param deviceLabel - The device label associated with the
     * screensharing device.
     * @param callback - The callback which should be notified when
     * a connection change has been detected.
     * @param initialFrameValue - Optional value indicating the idle
     * frame from which to detect screenshare changes.
     * @returns {void}
     */
    startListeningForConnection(
            deviceLabel: string,
            callback: (...args: any[]) => void,
            initialFrameValue?: number): void {
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
     * @param deviceLabel - The device label associated with the
     * screensharing device.
     * @param callback - The callback which was registered to be
     * notified when a connection change has been detected.
     * @returns {void}
     */
    stopListeningForConnection(deviceLabel: string, callback: (...args: any[]) => void): void {
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

const wiredScreenshareService = new WiredScreenshareService();

globalDebugger.register('wiredScreenshareService', wiredScreenshareService);

export default wiredScreenshareService;
