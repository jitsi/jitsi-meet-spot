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
        super(driver);

        this.meetingInput = new MeetingInput(this.driver);
        this.screensharePicker = new ScreensharePicker(this.driver);

        this.rootSelector = REMOTE_CONTROL;
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
