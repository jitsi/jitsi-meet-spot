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
        super(driver, CALENDAR_VIEW);

        this.meetingInput = new MeetingInput(this.driver);
    }

    /**
     * Scrapes the UI for the join code necessary for a Spot-Remote to connect
     * to Spot-TV.
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
     * @param {Map} [queryParams] - Query parameters to add to the URL.
     * @param {number} [visibilityWait] - Override for how long page load should
     * wait for before reporting the page as having failed to load. If -1 is passed then the waiting part will be
     * skipped.
     * @returns {void}
     */
    visit(queryParams, visibilityWait) {
        let calendarPageUrl = constants.SPOT_URL;

        if (queryParams) {
            calendarPageUrl += '?';

            for (const [ key, value ] of queryParams) {
                calendarPageUrl += `${key}=${value}&`;
            }
        }

        this.driver.url(calendarPageUrl);
        visibilityWait === -1 || this.waitForVisible(visibilityWait);
    }
}

module.exports = CalendarPage;
