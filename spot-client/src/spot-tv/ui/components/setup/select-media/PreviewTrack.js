import EventEmitter from 'events';

import { avUtils } from 'common/media';

/**
 * A model which wraps a JitsiLocalTrack so the JitsiLocalTrack can be
 * automatically destroyed if getUserMedia finishes after the model is
 * destroyed.
 *
 * @extends EventEmitter
 */
export default class PreviewTrack extends EventEmitter {
    _createPromise = null;

    _destroyed = false;

    _jitsiLocalTrack = null;

    _type = null;

    /**
     * Initializes a new {@code App} instance.
     *
     * @param {string} type - The media type of the preview. Should be one of
     * either "video" or "audio".
     * @param {string} deviceId - The WebRTC device ID of the media source to
     * capture.
     */
    constructor(type, deviceId) {
        super();

        this._type = type;
        this._deviceId = deviceId;

        this._emitAudioLevelChange = this._emitAudioLevelChange.bind(this);
    }

    /**
     * Calls getUserMedia to get an active MediaTrack.
     *
     * @returns {Promise} Resolve when the media track is obtained.
     */
    createPreview() {
        if (this._destroyed) {
            return Promise.reject('track destroyed');
        }

        if (this._createPromise) {
            return this._createPromise;
        }

        this._createPromise = this._type === 'audio'
            ? avUtils.createLocalAudioTrack(this._deviceId)
            : avUtils.createLocalVideoTrack(this._deviceId);

        return this._createPromise
            .then(jitsiLocalTrack => {
                if (jitsiLocalTrack.getDeviceId() !== this._deviceId) {
                    jitsiLocalTrack.dispose();

                    return Promise.reject('wrong-device-id');
                }

                if (this._destroyed) {
                    jitsiLocalTrack.dispose();

                    return Promise.reject('destroyed');
                }

                this._jitsiLocalTrack = jitsiLocalTrack;

                if (this._type === 'audio') {
                    this._jitsiLocalTrack.on(
                        avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED,
                        this._emitAudioLevelChange
                    );
                }

                return this;
            })
            .catch(reason => Promise.reject(reason));
    }

    /**
     * Stops any active MediaTrack.
     *
     * @returns {void}
     */
    destroy() {
        this._destroyed = true;

        if (this._jitsiLocalTrack) {
            this._jitsiLocalTrack.off(
                avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED,
                this._emitAudioLevelChange
            );

            this._jitsiLocalTrack.dispose();
        }
    }

    /**
     * Returns the underlying WebRtc MediaTrack if a preview track exists.
     *
     * @returns {MediaTrack|undefined}
     */
    getOriginalStream() {
        return this._jitsiLocalTrack
            && this._jitsiLocalTrack.getOriginalStream();
    }

    /**
     * Compares the passed in device ID with device ID of the MediaTrack this
     * instance should be wrapping.
     *
     * @param {string} deviceId - The device ID of a media source.
     * @returns {boolean}
     */
    isMatchindDeviceId(deviceId) {
        return this._deviceId === deviceId;
    }

    /**
     * Callback invoked when the audio level of a mic preview has changed.
     *
     * @param  {...any} args - The values from the event to re-emit.
     * @private
     * @returns {void}
     */
    _emitAudioLevelChange(...args) {
        this.emit(avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED, ...args);
    }
}
