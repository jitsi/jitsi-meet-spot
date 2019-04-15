const constants = require('../constants');
const MeetingInput = require('./meeting-input');
const PageObject = require('./page-object');

const ADMIN_SETTINGS_BUTTON = '[data-qa-id=admin-settings]';
const CALENDAR_VIEW = '[data-qa-id=home-view]';
const INFO_CODE = '[data-qa-id=info-code]';

/**
 * A page object for interacting with the calendar view of Spot-TV.
 */
class CalendarPage extends PageObject {
    /**
     * Initializes a new {@code CalendarPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver);

        this.meetingInput = new MeetingInput(this.driver);
        this.rootSelector = CALENDAR_VIEW;
    }

    /**
     * Scrapes the join code necessary for a Spot-Remote to connect to Spot-TV.
     *
     * @returns {string}
     */
    getJoinCode() {
        const joinCodeDisplay = this.waitForElementDisplayed(INFO_CODE);
        const fullText = joinCodeDisplay.getText();
        const parts = fullText.split('/');

        return parts[parts.length - 1];
    }

    /**
     * Interacts with the UI to visit the admin configuration view of Spot-TV.
     *
     * @returns {void}
     */
    goToAdminPage() {
        const adminSettingsButtons = this.driver.$(ADMIN_SETTINGS_BUTTON);

        adminSettingsButtons.waitForExist();
        adminSettingsButtons.moveTo();
        adminSettingsButtons.waitForDisplayed();
        adminSettingsButtons.click();
    }

    /**
     * Proceeds directly to the calendar view of Spot-TV.
     *
     * @returns {void}
     */
    visit() {
        this.driver.url(constants.SPOT_URL);
        this.waitForVisible();
    }
}

module.exports = CalendarPage;
