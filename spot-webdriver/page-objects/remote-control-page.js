const MeetingInput = require('./meeting-input');
const PageObject = require('./page-object');
const ScreensharePicker = require('./screenshare-picker');

const MEET_NOW_BUTTON = '[data-qa-id=meet-now]';
const REMOTE_CONTROL = '[data-qa-id=remoteControl-view]';
const SHARE_CONTENT_BUTTON = '[data-qa-id=share-content]';

/**
 * A page object for interacting with the waiting view of Spot-Remote.
 */
class RemoteControlPage extends PageObject {
    /**
     * Initializes a new {@code RemoteControlPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, REMOTE_CONTROL);

        this.meetingInput = new MeetingInput(this.driver);
        this.screensharePicker = new ScreensharePicker(this.driver);
    }

    /**
     * Returns an instance of the page object {@code MeetingInput}.
     *
     * @returns {MeetingInput}
     */
    getMeetingInput() {
        const meetNowButton = this.waitForElementDisplayed(MEET_NOW_BUTTON);

        meetNowButton.click(MEET_NOW_BUTTON);

        return this.meetingInput;
    }

    /**
     * Begins the wireless screensharing flow for when there is both wireless
     * and wired screensharing enabled.
     *
     * @returns {void}
     */
    startWirelessScreenshareWithPicker() {
        // Poll the javascript until wired screensharing is enabled. This is
        // currently necessary because the presence update of wired screensharing
        // becoming enabled can take a variable amount of time and there is no
        // UI indicator that it has become available.
        this.driver.waitUntil(
            () => this.driver.execute(() => {
                // browser context - you may not access client or console
                try {
                    return window.spot.store.getState().spotTv.wiredScreensharingEnabled;
                } catch {
                    return false;
                }
            }),
            5000,
            'wireless screensharing not available'
        );

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
        const shareContentButton = this.waitForElementDisplayed(SHARE_CONTENT_BUTTON);

        shareContentButton.click(SHARE_CONTENT_BUTTON);
    }
}

module.exports = RemoteControlPage;
