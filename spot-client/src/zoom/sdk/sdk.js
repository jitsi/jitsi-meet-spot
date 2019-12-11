/* globals process */

// To be used only during development. The api secret should not be committed
// into the codebase.
const API_SECRET = process.env.DEV_ONLY_ZOOM_API_SECRET;

import { errorCodes, events } from 'common/zoom';
import {
    AudioMuteController,
    HangUpController,
    ModalController,
    VideoMuteController
} from './controllers';

/**
 * Encapsulates interacting with Zoom meetings and its DOM.
 */
class Sdk {
    /**
     * Initializes a new instance.
     */
    constructor() {
        this._audioMuteController = null;
        this._modalController = null;
        this._onStatusChange = null;
        this._videoMuteController = null;

        this._cachedJoinOptions = {};
    }

    /**
     * Performs the bootstrapping required by the Zoom JS SDK.
     *
     * @param {Function} onStatusChange - Callback to invoke when there is
     * a meeting-related update.
     * @returns {Promise} Resolve if initialization was successful.
     */
    initialize(onStatusChange) {
        this._onStatusChange = onStatusChange;

        // Zoom assumes jQuery will be available globally.
        if (!window.jQuery || !window.$) {
            const $ = require('jquery');

            window.jQuery = $;
            window.$ = $;
        }

        const ZoomMtg = this._getZoomMtg();

        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareJssdk();

        const initPromise = new Promise((resolve, reject) => {
            ZoomMtg.init({
                leaveUrl: '/dist/zoom-close.html',
                isSupportAV: true,
                success() {
                    resolve();
                },
                error(res) {
                    reject(res);
                }
            });
        });

        return initPromise.then(() => {
            this._hangUpController = new HangUpController();
            this._audioMuteController = new AudioMuteController(muted => {
                this._onStatusChange(events.AUDIO_MUTE_UPDATED, { muted });
            });
            this._modalController = new ModalController();
            this._videoMuteController = new VideoMuteController(muted => {
                this._onStatusChange(events.VIDEO_MUTE_UPDATED, { muted });
            });
        });
    }

    /**
     * Attempts to leave the call.
     *
     * @returns {void}
     */
    hangUp() {
        this._hangUpController.hangUp();
    }

    /**
     * Attempts to establish a connection into a Zoom meeting.
     *
     * @param {Object} options - Configuration for how to join the meeting.
     * @param {string} options.apiKey - The client integration to use.
     * @param {string} options.meetingNumber - The Zoom meeting number (id).
     * @param {string} options.meetingSignService - The url to use for creating
     * a signed meeting ID using the api key and an api secret.
     * @param {string} [options.passWord] - The password needed to enter the Zoom meeting.
     * @param {string} [options.userName] - The display name for the local participant.
     * @returns {Promise}
     */
    joinMeeting(options) {
        this._cachedJoinOptions = options;

        const {
            apiKey,
            meetingNumber,
            meetingSignService,
            passWord = '',
            userName = 'Meeting Room'
        } = options;

        const meetingSignPromise = new Promise(resolve => {
            if (typeof API_SECRET === 'string') {
                const ZoomMtg = this._getZoomMtg();

                resolve(ZoomMtg.generateSignature({
                    meetingNumber,
                    apiKey,
                    apiSecret: API_SECRET,
                    role: 0
                }));

                return;
            }

            fetch(`${meetingSignService}`, {
                body: JSON.stringify({
                    apiKey,
                    meetingNumber,
                    role: 0
                }),
                headers: {
                    'content-type': 'application/json'
                },
                method: 'POST',
                mode: 'cors'
            })
            .then(response => response.json())
            .then(({ signature }) => resolve(signature));
        });

        return meetingSignPromise
            .then(signature => new Promise((resolve, reject) => {
                const ZoomMtg = this._getZoomMtg();

                ZoomMtg.join(
                    {
                        meetingNumber,
                        userName,
                        signature,
                        apiKey,
                        userEmail: '',
                        passWord,
                        success: res => resolve(res),
                        error: ({ errorCode }) => {
                            // Use a timeout to let the error modal display.
                            setTimeout(() => {
                                switch (errorCode) {
                                case errorCodes.WRONG_MEETING_PASSWORD:
                                case errorCodes.MEETING_NOT_START:
                                    this._modalController.dismiss();
                                    break;
                                }

                                reject({
                                    code: errorCode
                                });
                            });
                        }
                    }
                );
            })).then(() => {
                this._audioMuteController.start();
                this._videoMuteController.start();
            })
            .then(() => this._audioMuteController.initializeAudio())
            .then(() => this.setVideoMute(false));
    }

    /**
     * Sets audio mute to the desired state.
     *
     * @param {boolean} mute - Whether audio should be set to muted or not muted.
     * @returns {void}
     */
    setAudioMute(mute) {
        this._audioMuteController.setMute(mute);
    }

    /**
     * Sets video mute to the desired state.
     *
     * @param {boolean} mute - Whether video should be set to muted or not muted.
     * @returns {void}
     */
    setVideoMute(mute) {
        this._videoMuteController.setMute(mute);
    }

    /**
     * Tries to rejoin the meeting but with a password.
     *
     * @param {string} passWord - The password to use for joining the meeting.
     * @returns {void}
     */
    submitPassword(passWord) {
        return this.joinMeeting({
            ...this._cachedJoinOptions,
            passWord
        });
    }

    /**
     * Retrieves the library provided by Zoom for creating the Zoom meeting. This
     * is hidden behind a function so its loading can be delayed until other
     * globals have been set.
     *
     * @returns {Object}
     */
    _getZoomMtg() {
        const { ZoomMtg } = require('@zoomus/websdk');

        return ZoomMtg;
    }
}

export default new Sdk();
