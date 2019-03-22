import { JitsiMeetJSProvider } from 'common/vendor';

/**
 * Encapsulates all media and media-devices related calls into one object.
 */
export default {
    /**
     * Whether or not JitsiMeetJS has had initialized called on it. Used to
     * prevent multiple initialization calls.
     */
    _initialized: false,

    /**
     * Creates a new {@code JitsiLocalTrack} for a specified microphone.
     *
     * @param {string} micDeviceId - The device ID of the microphone which
     * should be used to capture audio.
     * @returns {Promise<JitsiLocalTrack>}
     */
    createLocalAudioTrack(micDeviceId) {
        return this._createTracks({
            micDeviceId,
            devices: [ 'audio' ]
        })
        .then(jitsiLocalTracks => jitsiLocalTracks[0]);
    },

    /**
     * Creates a new {@code JitsiLocalTrack} for a desktop stream with the
     * provided media configuration.
     *
     * @param {Object} mediaConfiguration - Configuration for how the desktop
     * stream should be constrained.
     * @param {Object} mediaConfiguration.desktopSharingFrameRate - The
     * frames per second which should be captured from the desktop sharing
     * source. Can include a "max" and "min" key, both being numbers.
     * @returns {Promise<JitsiLocalTrack>}
     */
    createLocalDesktopTrack(mediaConfiguration) {
        return this._createTracks({
            ...mediaConfiguration,
            devices: [ 'desktop' ]
        })
        .then(jitsiLocalTracks => jitsiLocalTracks[0]);
    },

    /**
     * Creates a new {@code JitsiLocalTrack} for audio and video.
     *
     * @returns {Promise<Array<JitsiLocalTrack>>}
     */
    createLocalTracks() {
        return this._createTracks({ devices: [ 'audio', 'video' ] });
    },

    /**
     * Creates a new {@code JitsiLocalTrack} for a specified camera.
     *
     * @param {string} cameraDeviceId - The device ID of the camera which
     * should be used to capture video.
     * @returns {Promise<JitsiLocalTrack>}
     */
    createLocalVideoTrack(cameraDeviceId) {
        return this._createTracks({
            cameraDeviceId,
            devices: [ 'video' ]
        })
        .then(jitsiLocalTracks => jitsiLocalTracks[0]);
    },

    /**
     * Returns a list of WebRTC-capable devices.
     *
     * @returns {Promise<Array>}
     */
    enumerateDevices() {
        this._initializeWebRTC();

        return new Promise(resolve =>
            JitsiMeetJSProvider.get().mediaDevices.enumerateDevices(resolve));
    },

    /**
     * Returns the enumeration of error events a {@code JitsiLocalTrack} may
     * fire.
     *
     * @returns {Object}
     */
    getTrackErrorEvents() {
        return JitsiMeetJSProvider.get().errors.track;
    },

    /**
     * Returns the enumeration of events a {@code JitsiLocalTrack} may fire.
     *
     * @returns {Object}
     */
    getTrackEvents() {
        return JitsiMeetJSProvider.get().events.track;
    },

    /**
     * Adds a listener for when the list of connected WebRTC capable devices has
     * changed.
     *
     * @param {Function} callback - Invoked when the list of connected WebRTC
     * capable devices has changed. The list of devices will be passed in.
     * @returns {void}
     */
    listenForDeviceListChanged(callback) {
        JitsiMeetJSProvider.get().mediaDevices.addEventListener(
            JitsiMeetJSProvider.get().events.mediaDevices.DEVICE_LIST_CHANGED,
            callback);
    },

    /**
     * Removes a listener for when the list of connected WebRTC capable devices
     * has changed.
     *
     * @param {Function} callback - The listener which should no longer receive
     * updates.
     * @returns {void}
     */
    stopListeningForDeviceListChanged(callback) {
        JitsiMeetJSProvider.get().mediaDevices.removeEventListener(
            JitsiMeetJSProvider.get().events.mediaDevices.DEVICE_LIST_CHANGED,
            callback
        );
    },

    /**
     * Ensures {@code JitsiMeetJS} is initialized for WebRTC related activity
     * and calls to create a {@code JitsiLocalTrack}.
     *
     * @param {Object} options - The details of the how to create the track.
     * @private
     * @returns {void}
     */
    _createTracks(options) {
        this._initializeWebRTC();

        return JitsiMeetJSProvider.get().createLocalTracks(options);
    },

    /**
     * Ensures {@code JitsiMeetJS} has been initialized so it can use WebRTC
     * related methods.
     *
     * @private
     * @returns {void}
     */
    _initializeWebRTC() {
        if (this._initialized) {
            return;
        }

        JitsiMeetJSProvider.get().init({});

        this._initialized = true;
    }
};
