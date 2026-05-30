import type { BrowserName } from '../constants/index.js';
import * as constants from '../constants/index.js';

import PageObject from './page-object.js';
import ScreensharePicker from './screenshare-picker.js';

const AUDIO_MUTE_BUTTON = '.mute-audio';
const AUDIO_UNMUTE_BUTTON = '.unmute-audio';
const CANCEL_MEETING_BUTTON = '.cancel-meeting';
const HANG_UP_BUTTON = '.hangup';
const LOWER_HAND_BUTTON = '.lower-hand';
const MORE_BUTTON = '.more';
const MORE_MODAL = '.more-modal';
const RAISE_HAND_BUTTON = '.raise-hand';
const REMOTE_CONTROL = '.in-call';
const SKIP_FEEDBACK_BUTTON = '.skip-feedback';
const START_SHARE_BUTTON = '.start-share-button';
const STOP_SHARE_BUTTON = '.stop-share-button';
const TILE_VIEW_ENABLE_BUTTON = '.enter-tile-view';
const TILE_VIEW_DISABLE_BUTTON = '.exit-tile-view';
const VIDEO_MUTE_BUTTON = '.mute-video';
const VIDEO_UNMUTE_BUTTON = '.unmute-video';
const VOLUME_BUTTON = '.volume';

/**
 * A page object for interacting with the in-meeting view of Spot-Remote.
 */
class SpotRemoteInMeetingPage extends PageObject {
    screensharePicker: ScreensharePicker;

    /**
     * Initializes a new {@code SpotRemoteInMeetingPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, REMOTE_CONTROL);

        this.screensharePicker = new ScreensharePicker(this.driver);
    }

    /**
     * Exits a meeting that is taking a while to load.
     *
     * @returns {void}
     */
    async cancelMeetingJoin(): Promise<void> {
        await this.waitForCancelMeetingToDisplay();

        const element = await this.select(CANCEL_MEETING_BUTTON);

        await element.click();
    }

    /**
     * Ends the current meeting.
     *
     * @returns {void}
     */
    async hangUp(): Promise<void> {
        const hangupButton = await this.waitForElementDisplayed(HANG_UP_BUTTON);

        await hangupButton.click();
    }

    /**
     * Check if the more button is available for interaction.
     *
     * @returns {boolean}
     */
    async hasMoreButton(): Promise<boolean> {
        const element = await this.select(MORE_BUTTON);

        return await element.isExisting();
    }

    /**
     * Check if the volume button is available for interaction.
     *
     * @returns {boolean}
     */
    async hasVolumeControls(): Promise<boolean> {
        if (await this.hasMoreButton()) {
            await this.openMoreMenu();
        }

        const element = await this.select(VOLUME_BUTTON);

        return await element.isExisting();
    }

    /**
     * Mutes the audio.
     *
     * @returns {void}
     */
    async muteAudio(): Promise<void> {
        await this.waitForAudioMutedStateToBe(false);

        const audioMuteButton = await this.select(AUDIO_MUTE_BUTTON);

        await audioMuteButton.click();
    }

    /**
     * Mutes the video.
     *
     * @returns {void}
     */
    async muteVideo(): Promise<void> {
        await this.waitForVideoMutedStateToBe(false);

        const videoMuteButton = await this.select(VIDEO_MUTE_BUTTON);

        await videoMuteButton.click();
    }

    /**
     * Displays the modal holder other nav buttons.
     *
     * @returns {void}
     */
    async openMoreMenu(): Promise<void> {
        const moreButtonEl = await this.waitForElementDisplayed(MORE_BUTTON);
        const moreModalEl = await this.select(MORE_MODAL);

        if (!await moreModalEl.isExisting()) {
            await moreButtonEl.click();
        }

        await this.waitForElementDisplayed(MORE_MODAL);
    }

    /**
     * Raises the hand.
     *
     * @returns {void}
     */
    async raiseHand(): Promise<void> {
        const raiseHandButton = await this.select(RAISE_HAND_BUTTON);

        await raiseHandButton.click();
    }

    /**
     * Lowers the hand.
     *
     * @returns {void}
     */
    async lowerHand(): Promise<void> {
        const lowerHandButton = await this.select(LOWER_HAND_BUTTON);

        await lowerHandButton.click();
    }

    /**
     * Waits for the hand raise button to be in raised/lowered state.
     *
     * @param raised - The state in which the hand raise button needs
     * to be in.
     * @returns {void}
     */
    async waitForHandRaisedStateToBe(raised: boolean): Promise<void> {
        await this.waitForBooleanState(
            raised,
            {
                onStateSelector: LOWER_HAND_BUTTON,
                offStateSelector: RAISE_HAND_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT
            });
    }

    /**
     * Enables or disable tile view layout.
     *
     * @param enabled - Whether tile view should be enabled or
     * disabled.
     * @returns {void}
     */
    async setTileView(enabled: boolean): Promise<void> {
        if (await this.hasMoreButton()) {
            await this.openMoreMenu();
        }

        const buttonToClickSelector = enabled
            ? TILE_VIEW_ENABLE_BUTTON
            : TILE_VIEW_DISABLE_BUTTON;

        await this.waitForBooleanState(
            enabled,
            {
                onStateSelector: TILE_VIEW_ENABLE_BUTTON,
                offStateSelector: TILE_VIEW_DISABLE_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT
            });

        const buttonToClick = await this.select(buttonToClickSelector);

        await buttonToClick.click();
    }

    /**
     * Dismisses the feedback overlay without submitting feedback.
     *
     * @returns {void}
     */
    async skipFeedback(): Promise<void> {
        const skipButton = await this.waitForElementDisplayed(SKIP_FEEDBACK_BUTTON);

        await skipButton.click();
    }

    /**
     * Begins the wireless screensharing flow for when there is both wireless
     * and wired screensharing enabled.
     *
     * @returns {void}
     */
    async startWirelessScreenshareWithPicker(): Promise<void> {
        await this.startWirelessScreenshareWithoutPicker();
        await this.screensharePicker.startWirelessScreenshare();
    }

    /**
     * Begins the wireless screensharing flow for when there is only wireless
     * screensharing enabled.
     *
     * @returns {void}
     */
    async startWirelessScreenshareWithoutPicker(): Promise<void> {
        await this.waitForScreensharingStateToBe(false);

        const startShareButton = await this.select(START_SHARE_BUTTON);

        await startShareButton.click();
    }

    /**
     * Turns off the current screenshare.
     *
     * @returns {void}
     */
    async stopScreensharing(): Promise<void> {
        await this.waitForScreensharingStateToBe(true);
        const stopShareEl = await this.select(STOP_SHARE_BUTTON);

        await stopShareEl.click();

        await this.screensharePicker.stopScreensharing();
    }

    /**
     * Unmutes the audio.
     *
     * @returns {void}
     */
    async unmuteAudio(): Promise<void> {
        await this.waitForAudioMutedStateToBe(true);

        const element = await this.select(AUDIO_UNMUTE_BUTTON);

        await element.click();
    }

    /**
     * Unmutes the video.
     *
     * @returns {void}
     */
    async unmuteVideo(): Promise<void> {
        await this.waitForVideoMutedStateToBe(true);

        const element = await this.select(VIDEO_UNMUTE_BUTTON);

        await element.click();
    }

    /**
     * Waits for the audio button to be in muted/unmuted state.
     *
     * @param muted - The state in which the audio buttons needs to be in.
     * @returns {void}
     */
    async waitForAudioMutedStateToBe(muted: boolean): Promise<void> {
        await this.waitForBooleanState(
            muted,
            {
                onStateSelector: AUDIO_UNMUTE_BUTTON,
                offStateSelector: AUDIO_MUTE_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT
            });
    }

    /**
     * Waits for the button to display which aborts a meeting join attempting.
     *
     * @returns {void}
     */
    async waitForCancelMeetingToDisplay(): Promise<void> {
        await this.waitForElementDisplayed(CANCEL_MEETING_BUTTON, 20000);
    }

    /**
     * Waits for the screenshare button to displays as screensharing is active
     * or inactive.
     *
     * @param enabled - True to wait for the Spot-TV to show
     * screensharing is active; false to wait for Spot-TV to show screensharing
     * is inactive.
     * @returns {void}
     */
    async waitForScreensharingStateToBe(enabled: boolean): Promise<void> {
        await this.waitForBooleanState(
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
     * @param muted - The state in which the video buttons needs to be in.
     * @returns {void}
     */
    async waitForVideoMutedStateToBe(muted: boolean): Promise<void> {
        await this.waitForBooleanState(
            muted,
            {
                onStateSelector: VIDEO_UNMUTE_BUTTON,
                offStateSelector: VIDEO_MUTE_BUTTON,
                waitTime: constants.REMOTE_COMMAND_WAIT
            });
    }
}

export default SpotRemoteInMeetingPage;
