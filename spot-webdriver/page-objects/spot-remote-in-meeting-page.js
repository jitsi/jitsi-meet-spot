const constants = require('../constants');
const PageObject = require('./page-object');

const AUDIO_MUTE_BUTTON = '[data-qa-id=mute-audio]';
const AUDIO_UNMUTE_BUTTON = '[data-qa-id=unmute-audio]';
const REMOTE_CONTROL = '[data-qa-id=remoteControl-view]';
const SHARE_PICKER = '[data-qa-id=screenshare-picker]';
const START_SHARE_BUTTON = '[data-qa-id=start-share]';
const STOP_SHARE_BUTTON = '[data-qa-id=stop-share]';
const STOP_SHARE_CONFIRM = '[data-qa-id=stop-share-button]';

/**
 * A page object for interacting with the in meeting view of Spot-Remote.
 */
class SpotRemoteInMeetingPage extends PageObject {
    /**
     * Initializes a new {@code SpotRemoteInMeetingPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.rootSelector = REMOTE_CONTROL;
    }

    /**
     * Mutes the audio.
     *
     * @returns {void}
     */
    muteAudio() {
        this.waitForAudioMutedStateToBe(false);

        this.select(AUDIO_MUTE_BUTTON).click();
    }

    /**
     * Turns off the current screenshare.
     *
     * @returns {void}
     */
    stopScreensharing() {
        this.waitForScreensharingStateToBe(true);

        this.select(STOP_SHARE_BUTTON).click();

        this.waitForSharePicker();

        this.select(STOP_SHARE_CONFIRM).click();
    }

    /**
     * Unmutes the audio.
     *
     * @returns {void}
     */
    unmuteAudio() {
        this.waitForAudioMutedStateToBe(true);

        this.select(AUDIO_UNMUTE_BUTTON).click();
    }

    /**
     * Waits for the audio button to be in muted/unmuted state.
     *
     * @param {boolean} muted - The state in which the audio buttons needs to be in.
     * @returns {void}
     */
    waitForAudioMutedStateToBe(muted) {
        const muteButtonSelector = muted ? AUDIO_UNMUTE_BUTTON : AUDIO_MUTE_BUTTON;

        this.waitForElementDisplayed(muteButtonSelector, constants.REMOTE_COMMAND_WAIT);
    }

    /**
     * Waits for the screenshare button to displays as screensharing is active
     * or inactive.
     *
     * @param {boolean} enabled - True to wait for the Spot-TV to show
     * screensharing is active; false to wait for Spot-TV to show screensharing
     * is inactive.
     * @returns {void}
     */
    waitForScreensharingStateToBe(enabled) {
        const shareButtonSelector
            = enabled ? STOP_SHARE_BUTTON : START_SHARE_BUTTON;

        this.waitForElementDisplayed(shareButtonSelector, constants.REMOTE_COMMAND_WAIT);
    }

    /**
     * Waits for the component for screenshare interaction confirmation to be
     * displayed.
     *
     * @returns {void}
     */
    waitForSharePicker() {
        this.waitForElementDisplayed(SHARE_PICKER);
    }
}

module.exports = SpotRemoteInMeetingPage;
