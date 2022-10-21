const constants = require('../constants');
const MeetingInput = require('./meeting-input');
const PageObject = require('./page-object');

const ADMIN_SETTINGS_BUTTON = '[data-qa-id=admin-settings]';
const CALENDAR_VIEW = '//div[@class="spot-home"]';
const INFO_CODE = '//span[@class="info-code-container"]/span';

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
    async getJoinCode() {
        const joinCodeDisplay = await this.waitForElementDisplayed(INFO_CODE);
        const fullText = await joinCodeDisplay.getText();

        return fullText;
    }

    /**
     * Interacts with the UI to visit the admin configuration view of Spot-TV.
     *
     * @returns {void}
     */
    async goToAdminPage() {
        const adminSettingsButtons = await browser[this.driver].$(ADMIN_SETTINGS_BUTTON);

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
    async visit(queryParams, visibilityWait) {
        let calendarPageUrl = constants.SPOT_URL;

        if (queryParams) {
            calendarPageUrl += '?';

            for (const [ key, value ] of queryParams) {
                calendarPageUrl += `${key}=${value}&`;
            }
        }

        await browser[this.driver].url(calendarPageUrl);

        visibilityWait === -1 || await this.waitForVisible(visibilityWait);
    }
}

module.exports = CalendarPage;
