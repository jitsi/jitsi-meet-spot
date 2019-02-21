import { JitsiMeetJSProvider } from 'common/vendor';

/**
 * The default dimensions for the video element and canvas. Lower resolution is
 * okay because we are trying to get general change detection.
 */
const ELEMENT_HEIGHT = 240;
const ELEMENT_WIDTH = 320;

/**
 * Encapsulates detecting when a wired screenshare input has changed its video
 * output, which suggests a device has been connected to it. Generally the
 * wired screenshare input will emit a static frame when in an idle state and
 * that frame changes when a device is connected.
 */
export default class VideoChangeListener {
    /**
     * Initializes a new {@code VideoChangeListener} instance.
     *
     * @param {string} deviceLabel - The label associated with the video input
     * device to be monitored. The label is likely obtained from a call to
     * enumerateDevices.
     * @param {number} initialFrameValue - The rgba sum to use as a standard
     * to detect when a device may have been plugged in. If not defined it
     * will be calculated using the current stream.
     */
    constructor(deviceLabel, initialFrameValue) {
        this._deviceLabel = deviceLabel;
        this._initialFrameValue = initialFrameValue;

        /**
         * The video element is used to play the media stream in order to
         * capture frames.
         *
         * @type {HTMLVideoElement}
         */
        this._videoElement = document.createElement('video');
        this._videoElement.width = ELEMENT_WIDTH;
        this._videoElement.height = ELEMENT_HEIGHT;
        this._videoElement.autoplay = true;

        /**
         * Video frames are drawn onto a canvas and compared to the video frame
         * when idle.
         *
         * @type {HTMLCanvasElement}
         */
        const canvas = document.createElement('canvas');

        canvas.width = ELEMENT_WIDTH;
        canvas.height = ELEMENT_HEIGHT;

        /**
         * The context of the canvas is used to get statistics about the image
         * drawn onto the canvas, which are then used to detect change.
         *
         * @type {RenderingContext}
         */
        this._context = canvas.getContext('2d');

        /**
         * The WebRTC media stream, wrapped by a JitsiTrack model, which should
         * be monitored for change.
         *
         * @type {JitsiLocalTrack|null}
         */
        this._jitsiLocalTrack = null;

        /**
         * The interval which checks the current video frame with initial idle
         * frame.
         *
         * @type {IntervalID}
         */
        this._diffCheckInterval = null;

        /**
         * Callbacks to invoke when there is a change to and from the idle
         * frame.
         *
         * @type {Set}
         */
        this._listeners = new Set();

        /**
         * It is assumed the listener starts with no device connected and any
         * changes will change this variable to true or back to false.
         *
         * @type {boolean}
         */
        this._isDeviceConnected = false;
    }

    /**
     * Adds a callback to invoke when the video has changed to or from the
     * idle frame.
     *
     * @param {Function} callback - Callback to invoke when there is video
     * change to or from the idle frame.
     * @returns {void}
     */
    addChangeListener(callback) {
        this._listeners.add(callback);
    }

    /**
     * Cleans up any ongoing processes for listening to video changes.
     *
     * @returns {void}
     */
    destroy() {
        this._listeners.clear();

        clearInterval(this._diffCheckInterval);

        this._jitsiLocalTrack && this._jitsiLocalTrack.dispose();

        this._videoElement.pause();
        this._videoElement.removeAttribute('src');
        this._videoElement.removeAttribute('srcObject');
        this._videoElement.load();
    }

    /**
     * This is algorithm to score the current video frame. It returns a value
     * which can be used to compare with results from previous calls to check
     * if a change has occurred in the video. Currently the algorithm uses a sum
     * of all RGB values on the canvas.
     *
     * @private
     * @returns {number}
     */
    getCurrentValue() {
        // First update the canvas so the current video frame can be calculated.
        this._context.drawImage(
            this._videoElement,
            0, 0,
            this._videoElement.videoWidth, this._videoElement.videoHeight,
            0, 0,
            ELEMENT_WIDTH, ELEMENT_HEIGHT);

        // From the context itself get {@type ImageData} from the current image
        // on the canvas. The data attribute is a (very long) array of integers
        // representing the Red, Green, Blue, and then Alpha value for each
        // pixel.
        const { data: rgbaValues }
            = this._context.getImageData(0, 0, ELEMENT_WIDTH, ELEMENT_HEIGHT);

        // The sum of all rgba values.
        let score = 0;

        // Iterate by 4 as the array has RGBA values in order for each pixel.
        for (let i = 0; i < rgbaValues.length; i += 4) {
            // Borrowed/stolen from github.com/lonekorean/diff-cam-scratchpad
            const pixelDiff = (rgbaValues[i] * 0.3)
                + (rgbaValues[i + 1] * 0.6)
                + (rgbaValues[i + 2] * 0.1);

            if (pixelDiff >= 32) {
                score++;
            }
        }

        return score;
    }

    /**
     * Returns whether or not there are any listeners registered to be notified
     * of video changes.
     *
     * @returns {boolean}
     */
    hasActiveListeners() {
        return this._listeners.length > 0;
    }

    /**
     * De-registers a callback to no longer be notified of when the video stream
     * enters or exits the idle frame.
     *
     * @param {Function} callback - The callback which should no longer be
     * notified.
     * @returns {void}
     */
    removeChangeListener(callback) {
        this._listeners.delete(callback);
    }

    /**
     * Begins looking for changes from the screensharing input. This method
     * assumes there is nothing connected or that an initial value has been
     * passed in to compare to.
     *
     * @param {Function} callback - What?!
     * @returns {Promise}
     */
    start() {
        if (this._startPromise) {
            return this._startPromise;
        }

        this._startPromise = this._getVideoStream()
            .then(jitsiLocalTrack => {
                this._jitsiLocalTrack = jitsiLocalTrack;
                this._videoElement.srcObject
                    = jitsiLocalTrack.getOriginalStream();

                return new Promise(resolve => {
                    this._videoElement.addEventListener('loadeddata', resolve);
                });
            })
            .then(() => this._startDiffCheckInterval());

        return this._startPromise;
    }

    /**
     * A helper to encapsulate acquiring the WebRTC media stream for the known
     * device label.
     *
     * @private
     * @returns {Promise}
     */
    _getVideoStream() {
        const JitsiMeetJS = JitsiMeetJSProvider.get();
        const enumerateDevicesPromise = new Promise(resolve =>
            JitsiMeetJS.mediaDevices.enumerateDevices(resolve));

        let desiredDeviceId;

        return enumerateDevicesPromise
            .then(devices =>
                devices.find(device => device.label === this._deviceLabel))
            .then((deviceInfo = {}) => {
                const { deviceId } = deviceInfo;

                if (!deviceId) {
                    return Promise.reject('Device not found');
                }

                desiredDeviceId = deviceId;

                return JitsiMeetJS.createLocalTracks({
                    cameraDeviceId: deviceId,
                    devices: [ 'video' ]
                });
            })
            .then(jitsiLocalTracks => {
                // Verify the correct track has been obtained because jitsi
                // does not use exact device id matching for getUserMedia.

                const jitsiVideoTrack = jitsiLocalTracks[0];
                const mediaStream = jitsiLocalTracks[0].getOriginalStream();
                const videoTracks = mediaStream && mediaStream.getVideoTracks();
                const videoTrack = videoTracks[0];
                const constraints = videoTrack.getConstraints();

                if (constraints.deviceId !== desiredDeviceId) {
                    jitsiVideoTrack.dispose();

                    return Promise.reject('Did not obtain track');
                }

                return jitsiVideoTrack;
            });
    }

    /**
     * Invokes the callback for video having experienced a significant change
     * from its initial starting point.
     *
     * @param {boolean} isDeviceConnected - Whether or not the change indicates
     * a device has been connected or disconnected.
     * @private
     * @returns {void}
     */
    _notifyChangeDetected(isDeviceConnected) {
        this._listeners.forEach(listener => listener(isDeviceConnected));
    }

    /**
     * Creates the interval which will periodically check if the video input
     * is displaying something other than the idle frame.
     *
     * @private
     * @returns {void}
     */
    _startDiffCheckInterval() {
        clearInterval(this._diffCheckInterval);

        const rgbScoreAtRest = typeof this._initialFrameValue === 'undefined'
            ? this.getCurrentValue()
            : this._initialFrameValue;

        this._diffCheckInterval = setInterval(() => {
            const currentRGBScore = this.getCurrentValue();

            // The value 1000 is an arbitrary threshold that must be exceed for
            // change to be detected.
            const isDeviceConnected
                = Math.abs(rgbScoreAtRest - currentRGBScore) > 1000;

            if (isDeviceConnected !== this._isDeviceConnected) {
                this._isDeviceConnected = isDeviceConnected;
                this._notifyChangeDetected(this._isDeviceConnected);
            }
        }, 1000);
    }
}
