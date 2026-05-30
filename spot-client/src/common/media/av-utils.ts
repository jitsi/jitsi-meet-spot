
import { logger } from 'common/logger';
import { JitsiMeetJSProvider } from 'common/vendor';
import debounce from 'lodash.debounce';

type DeviceListChangeListener = (deviceList: any[]) => void;

interface AvUtils {
    _initialized: boolean;
    _cachedDeviceList: any[] | null;
    _deviceListChangeListeners: Set<DeviceListChangeListener>;
    _videoDeviceListChangeListeners: Set<DeviceListChangeListener>;

    createLocalAudioTrack(micDeviceId: string): Promise<any>;
    createLocalDesktopTrack(mediaConfiguration: any): Promise<any>;
    createLocalTracks(): Promise<any[]>;
    createLocalVideoTrack(cameraDeviceId: string): Promise<any>;
    enumerateDevices(): Promise<any>;
    enumerateVideoDevices(): Promise<any[]>;
    getTrackEvents(): any;
    listenForCameraDeviceListChange(callback: DeviceListChangeListener): void;
    listenForDeviceListChange(callback: DeviceListChangeListener): void;
    stopListeningForCameraDeviceListChange(callback: DeviceListChangeListener): void;
    stopListeningForDeviceListChange(callback: DeviceListChangeListener): void;
    _createTracks(options: any): Promise<any[]>;
    _initializeWebRTC(): void;
    _onDeviceListChange(deviceList: any[]): void;
}

/**
 * Encapsulates all media and media-devices related calls into one object.
 */
const avUtils: AvUtils = {
    /**
     * Whether or not JitsiMeetJS has had initialized called on it. Used to
     * prevent multiple initialization calls.
     */
    _initialized: false,

    _cachedDeviceList: null,

    _deviceListChangeListeners: new Set(),

    _videoDeviceListChangeListeners: new Set(),

    /**
     * Creates a new {@code JitsiLocalTrack} for a specified microphone.
     *
     * @param micDeviceId - The device ID of the microphone which
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
     * @param mediaConfiguration - Configuration for how the desktop
     * stream should be constrained.
     * @param mediaConfiguration.desktopSharingFrameRate - The
     * frames per second which should be captured from the desktop sharing
     * source. Can include a "max" and "min" key, both being numbers.
     * @returns {Promise<JitsiLocalTrack>}
     */
    createLocalDesktopTrack(mediaConfiguration) {
        return this._createTracks({
            ...mediaConfiguration,
            devices: [ 'desktop' ]
        })

        // TODO: Skip audio track when sharing a Chrome tab. There should be a way
        // to disable that on LJM.
        .then(jitsiLocalTracks => jitsiLocalTracks.find((t: any) => t.isVideoTrack()));
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
     * @param cameraDeviceId - The device ID of the camera which
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

        const JitsiMeetJS = JitsiMeetJSProvider.get();

        // TODO: implementing handling of gum permissions being denied
        return JitsiMeetJS.mediaDevices.isDevicePermissionGranted()
            .then((hasPermission: boolean) => {
                if (hasPermission) {
                    return Promise.resolve();
                }

                return this.createLocalTracks()
                    .then(tracks => tracks.forEach((track: any) => track.dispose()));
            })
            .then(() => new Promise(resolve =>
                JitsiMeetJS.mediaDevices.enumerateDevices(resolve)));
    },

    /**
     * Returns all connected video input devices.
     *
     * @returns {Array<Object>}
     */
    enumerateVideoDevices() {
        const enumerateDevicesPromise = this._cachedDeviceList
            ? Promise.resolve(this._cachedDeviceList)
            : this.enumerateDevices();

        return enumerateDevicesPromise
            .then((deviceList: any[]) => deviceList.filter(
                device => device.kind === 'videoinput'));
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
     * Be notified when a new camera device has been connected or disconnected.
     *
     * @param callback - The function to invoke on camera change.
     * @private
     * @returns {void}
     */
    listenForCameraDeviceListChange(callback) {
        this._videoDeviceListChangeListeners.add(callback);
    },

    /**
     * Be notified of any changes to connected audio and video devices.
     *
     * @param callback - The function to invoke on when a device has
     * been connected or removed.
     * @private
     * @returns {void}
     */
    listenForDeviceListChange(callback) {
        this._deviceListChangeListeners.add(callback);
    },

    /**
     * Stop being notified when a new camera device has been connected or
     * disconnected.
     *
     * @param callback - The function which should no longer be
     * called.
     * @private
     * @returns {void}
     */
    stopListeningForCameraDeviceListChange(callback) {
        this._videoDeviceListChangeListeners.delete(callback);
    },

    /**
     * Stop being notified when audio and video devices are disconnected or
     * connected.
     *
     * @param callback - The function which should no longer be
     * called.
     * @private
     * @returns {void}
     */
    stopListeningForDeviceListChange(callback) {
        this._deviceListChangeListeners.delete(callback);
    },

    /**
     * Ensures {@code JitsiMeetJS} is initialized for WebRTC related activity
     * and calls to create a {@code JitsiLocalTrack}.
     *
     * @param options - The details of the how to create the track.
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

        this._onDeviceListChange = debounce(
            this._onDeviceListChange.bind(this),
            500
        );

        JitsiMeetJSProvider.get().mediaDevices.addEventListener(
            JitsiMeetJSProvider.get().events.mediaDevices.DEVICE_LIST_CHANGED,
            this._onDeviceListChange);

        this._initialized = true;
    },

    /*
     * Callback invoked when the list of known media devices has changed.
     * Notifies any registered listeners of the change.
     *
     * @param deviceList - Descriptions of the media devices,
     * as provided by WebRTC.
     * @private
     * @returns {void}
     */
    _onDeviceListChange(deviceList) {
        this._cachedDeviceList = deviceList;

        this._deviceListChangeListeners.forEach(
            callback => callback(deviceList));

        const videoInputDevices
            = deviceList.filter(device => device.kind === 'videoinput');

        if (!videoInputDevices.length) {
            logger.warn('Received device list change with no cameras');
        }

        if (videoInputDevices.length
            && !videoInputDevices.some(device => Boolean(device.label))) {
            logger.warn(
                'Received device list change but maybe no video permission');
        }

        this._videoDeviceListChangeListeners.forEach(
            callback => callback(videoInputDevices));
    }
};

export default avUtils;
