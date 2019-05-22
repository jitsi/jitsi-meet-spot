const constants = require('../constants');
const PageObject = require('./page-object');
const ScreensharePicker = require('./screenshare-picker');

const AUDIO_MUTE_BUTTON = '[data-qa-id=mute-audio]';
const AUDIO_UNMUTE_BUTTON = '[data-qa-id=unmute-audio]';
const MORE_BUTTON = '[data-qa-id=more]';
const MORE_MODAL = '[data-qa-id=more-modal]';
const REMOTE_CONTROL = '[data-qa-id=remoteControl-view]';
const START_SHARE_BUTTON = '[data-qa-id=start-share]';
const STOP_SHARE_BUTTON = '[data-qa-id=stop-share]';
const TILE_VIEW_ENABLE_BUTTON = '[data-qa-id=enter-tile-view]';
const TILE_VIEW_DISABLE_BUTTON = '[data-qa-id=exit-tile-view]';
const VIDEO_MUTE_BUTTON = '[data-qa-id=mute-video]';
const VIDEO_UNMUTE_BUTTON = '[data-qa-id=unmute-video]';


/**
 * A page object for interacting with the in-meeting view of Spot-Remote.
 */
class SpotRemoteInMeetingPage extends PageObject {
    /**
     * Initializes a new {@code SpotRemoteInMeetingPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.screensharePicker = new ScreensharePicker(this.driver);

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
     * Mutes the video.
     *
     * @returns {void}
     */
    muteVideo() {
        this.waitForVideoMutedStateToBe(false);

        this.select(VIDEO_MUTE_BUTTON).click();
    }

    /**
     * Displays the modal holder other nav buttons.
     *
     * @returns {void}
     */
    openMoreMenu() {
        this.waitForElementDisplayed(MORE_BUTTON);

        if (!this.select(MORE_MODAL).isExisting()) {
            this.select(MORE_BUTTON).click();
        }

        this.waitForElementDisplayed(MORE_MODAL);
    }

    /**
     * Enables or disable tile view layout.
     *
     * @param {boolean} enabled - Whether tile view should be enabled or
     * disabled.
     * @returns {void}
     */
    setTileView(enabled) {
        this.openMoreMenu();

        const buttonToClick = enabled
            ? TILE_VIEW_ENABLE_BUTTON
            : TILE_VIEW_DISABLE_BUTTON;

        this.waitForBooleanState(
            enabled,
            {
                onStateSelector: TILE_VIEW_ENABLE_BUTTON,
                offStateSelector: TILE_VIEW_DISABLE_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT
            });

        this.select(buttonToClick).click();
    }

    /**
     * Begins the wireless screensharing flow for when there is both wireless
     * and wired screensharing enabled.
     *
     * @returns {void}
     */
    startWirelessScreenshareWithPicker() {
        this.startWirelessScreenshareWithoutPicker();
        this.screensharePicker.startWirelessScreenshare();
    }

    /**
     * Begins the wireless screensharing flow for when there is only wireless
     * screensharing enabled.
     *
     * @returns {void}
     */
    startWirelessScreenshareWithoutPicker() {
        this.waitForScreensharingStateToBe(false);

        this.select(START_SHARE_BUTTON).click();
    }

    /**
     * Turns off the current screenshare.
     *
     * @returns {void}
     */
    stopScreensharing() {
        this.waitForScreensharingStateToBe(true);

        this.select(STOP_SHARE_BUTTON).click();

        this.screensharePicker.stopScreensharing();
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
     * Unmutes the video.
     *
     * @returns {void}
     */
    unmuteVideo() {
        this.waitForVideoMutedStateToBe(true);

        this.select(VIDEO_UNMUTE_BUTTON).click();
    }

    /**
     * Waits for the audio button to be in muted/unmuted state.
     *
     * @param {boolean} muted - The state in which the audio buttons needs to be in.
     * @returns {void}
     */
    waitForAudioMutedStateToBe(muted) {
        this.waitForBooleanState(
            muted,
            {
                onStateSelector: AUDIO_UNMUTE_BUTTON,
                offStateSelector: AUDIO_MUTE_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT
            });
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
        this.waitForBooleanState(
            enabled,
            {
                onStateSelector: STOP_SHARE_BUTTON,
                offStateSelector: START_SHARE_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT

            });
    }

    /**
     * Waits for the video button to be in muted/unmuted state.
     *
     * @param {boolean} muted - The state in which the video buttons needs to be in.
     * @returns {void}
     */
    waitForVideoMutedStateToBe(muted) {
        this.waitForBooleanState(
            muted,
            {
                onStateSelector: VIDEO_UNMUTE_BUTTON,
                offStateSelector: VIDEO_MUTE_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT
            });
    }
}

module.exports = SpotRemoteInMeetingPage;
