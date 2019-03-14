const constants = require('../constants');
const PageObject = require('./page-object');

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
