import { Emitter } from 'common/emitter';
import { avUtils } from 'common/media';

/**
 * A model which wraps a JitsiLocalTrack so the JitsiLocalTrack can be
 * automatically destroyed if getUserMedia finishes after the model is
 * destroyed.
 */
export default class PreviewTrack extends Emitter {
    _createPromise: Promise<any> | null = null;

    _destroyed = false;

    _jitsiLocalTrack: any = null;

    _type: string | null = null;

    _deviceId: string;

    /**
     * Initializes a new {@code App} instance.
     *
     * @param type - The media type of the preview. Should be one of
     * either "video" or "audio".
     * @param deviceId - The WebRTC device ID of the media source to
     * capture.
     */
    constructor(type: string, deviceId: string) {
        super();

        this._type = type;
        this._deviceId = deviceId;

        this._emitAudioLevelChange = this._emitAudioLevelChange.bind(this);
    }

    /**
     * Calls getUserMedia to get an active MediaTrack.
     *
     * @returns Resolve when the media track is obtained.
     */
    createPreview(): Promise<any> {
        if (this._destroyed) {
            return Promise.reject('track destroyed');
        }

        if (this._createPromise) {
            return this._createPromise;
        }

        this._createPromise
            = this._type === 'audio'
                ? avUtils.createLocalAudioTrack(this._deviceId)
                : avUtils.createLocalVideoTrack(this._deviceId);

        return this._createPromise
            .then((jitsiLocalTrack: any) => {
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
            .catch((reason: any) => Promise.reject(reason));
    }

    /**
     * Stops any active MediaTrack.
     *
     * @returns {void}
     */
    destroy(): void {
        this._destroyed = true;

        if (this._jitsiLocalTrack) {
            this._jitsiLocalTrack.off(avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED, this._emitAudioLevelChange);

            this._jitsiLocalTrack.dispose();
        }
    }

    /**
     * Returns the underlying WebRtc MediaTrack if a preview track exists.
     *
     * @returns {MediaTrack|undefined}
     */
    getOriginalStream(): any {
        return this._jitsiLocalTrack && this._jitsiLocalTrack.getOriginalStream();
    }

    /**
     * Compares the passed in device ID with device ID of the MediaTrack this
     * instance should be wrapping.
     *
     * @param deviceId - The device ID of a media source.
     * @returns
     */
    isMatchindDeviceId(deviceId: string): boolean {
        return this._deviceId === deviceId;
    }

    /**
     * Callback invoked when the audio level of a mic preview has changed.
     *
     * @param  args - The values from the event to re-emit.
     * @private
     * @returns {void}
     */
    _emitAudioLevelChange(...args: any[]): void {
        this.emit(avUtils.getTrackEvents().TRACK_AUDIO_LEVEL_CHANGED, ...args);
    }
}
