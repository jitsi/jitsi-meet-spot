import type { BrowserName } from '../constants/index.js';

import MeetingInput from './meeting-input.js';
import PageObject from './page-object.js';
import ScreensharePicker from './screenshare-picker.js';

const MEET_NOW_BUTTON = '#meet-now';
const REMOTE_CONTROL = '.remoteControl-view';
const SHARE_CONTENT_BUTTON = '#share-content';
const WAITING_FOR_CALL_SUBVIEW = '.waiting-for-call-view';
const WAITING_FOR_SPOT_TV_LABEL = '#waiting-for-spot-tv]';

/**
 * A page object for interacting with the waiting view of Spot-Remote.
 */
class RemoteControlPage extends PageObject {
    meetingInput: MeetingInput;
    screensharePicker: ScreensharePicker;

    /**
     * Initializes a new {@code RemoteControlPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, REMOTE_CONTROL);

        this.meetingInput = new MeetingInput(this.driver);
        this.screensharePicker = new ScreensharePicker(this.driver);
    }

    /**
     * Returns an instance of the page object {@code MeetingInput}.
     *
     * @returns {MeetingInput}
     */
    async getMeetingInput(): Promise<MeetingInput> {
        const meetNowButton = await this.waitForElementDisplayed(MEET_NOW_BUTTON);

        await meetNowButton.click();

        return this.meetingInput;
    }

    /**
     * Return a {@code PageObject} instance for the "waiting for Spot TV to connect" label.
     *
     * @returns {PageObject}
     */
    getWaitingForSpotTvLabel(): PageObject {
        return new PageObject(this.driver, WAITING_FOR_SPOT_TV_LABEL);
    }

    /**
     * Wait specifically for the subview of the remote control page which shows
     * when Spot-TV is not in a call.
     *
     * @param waitTime - Optional wait time given in milliseconds.
     * @returns {void}
     */
    async waitWaitingForCallViewToDisplay(waitTime?: number): Promise<void> {
        await this.waitForElementDisplayed(WAITING_FOR_CALL_SUBVIEW, waitTime);
    }

    /**
     * Begins the wireless screensharing flow for when there is both wireless
     * and wired screensharing enabled.
     *
     * @returns {void}
     */
    async startWirelessScreenshareWithPicker(): Promise<void> {
        // Poll the javascript until wired screensharing is enabled. This is
        // currently necessary because the presence update of wired screensharing
        // becoming enabled can take a variable amount of time and there is no
        // UI indicator that it has become available.
        await this._browser.waitUntil(
            async () => await this._browser.execute(() => {
                // browser context - you may not access client or console
                try {
                    return window.spot.store.getState().spotTv.wiredScreensharingEnabled;
                } catch {
                    return false;
                }
            }),
            {
                timeout: 5000,
                timeoutMsg: 'wireless screensharing not available'
            }
        );

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
        const shareContentButton = await this.waitForElementDisplayed(SHARE_CONTENT_BUTTON);

        await shareContentButton.click();
    }
}

export default RemoteControlPage;
