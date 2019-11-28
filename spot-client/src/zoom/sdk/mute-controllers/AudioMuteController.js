import AbstractMuteController from './AbstractMuteController';

/**
 * Listens for audio mute changes by observing the Zoom UI.
 */
export default class AudioMuteController extends AbstractMuteController {
    static AUDIO_INITIAL_START_BUTTON_DISABLED = '#pc-join.footer-item-disabled';
    static AUDIO_INITIAL_START_BUTTON = '#pc-join';
    static AUDIO_MUTE_BUTTON = '[aria-label="mute my microphone"]';
    static AUDIO_START_BUTTON = '[aria-label="join audio"]';
    static AUDIO_UNMUTE_BUTTON = '[aria-label="unmute my microphone"]';

    /**
     * Starts the mic for the meeting.
     *
     * @returns {Promise}
     */
    initializeAudio() {
        const intervalMax = Date.now() + 15000;

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (!document.querySelector(AudioMuteController.AUDIO_INITIAL_START_BUTTON_DISABLED)) {
                    document.querySelector(AudioMuteController.AUDIO_INITIAL_START_BUTTON).click();

                    clearInterval(interval);
                    resolve();
                } else if (Date.now() > intervalMax) {
                    clearInterval(interval);
                    reject();
                }
            }, 100);
        });
    }

    /**
     * Sets audio mute to the desired state.
     *
     * @inheritdoc
     */
    setMute(mute) {
        this._clickIfExists(
            mute
                ? AudioMuteController.AUDIO_MUTE_BUTTON
                : AudioMuteController.AUDIO_UNMUTE_BUTTON
        );
    }

    /**
     * Returns whether or not audio input is currently muted.
     *
     * @inheritdoc
     */
    _getCurrentMuteState() {
        const hasUnmuteButton = Boolean(document.querySelector(AudioMuteController.AUDIO_UNMUTE_BUTTON))
            || Boolean(document.querySelector(AudioMuteController.AUDIO_START_BUTTON));

        return hasUnmuteButton;
    }

    /**
     * Returns the HTMLElement which updates known audio mute state.
     *
     * @inheritdoc
     */
    _getElementToObserve() {
        return document.querySelector(AudioMuteController.AUDIO_START_BUTTON)
            || document.querySelector(AudioMuteController.AUDIO_MUTE_BUTTON)
            || document.querySelector(AudioMuteController.AUDIO_UNMUTE_BUTTON);
    }
}
