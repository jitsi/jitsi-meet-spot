import * as constants from '../constants/index.js';
import type { BrowserName } from '../constants/index.js';

import MeetingInput from './meeting-input.js';
import PageObject from './page-object.js';

const ADMIN_SETTINGS_BUTTON = '.admin-settings';
const CALENDAR_VIEW = '//div[@class="spot-home"]';
const INFO_CODE = '//span[@class="info-code-container"]/span';

/**
 * A page object for interacting with the calendar view of Spot-TV.
 */
class CalendarPage extends PageObject {
    meetingInput: MeetingInput;

    /**
     * Initializes a new {@code CalendarPage} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, CALENDAR_VIEW);

        this.meetingInput = new MeetingInput(this.driver);
    }

    /**
     * Scrapes the UI for the join code necessary for a Spot-Remote to connect
     * to Spot-TV.
     *
     * @returns {string}
     */
    async getJoinCode(): Promise<string> {
        const joinCodeDisplay = await this.waitForElementDisplayed(INFO_CODE);
        const fullText = await joinCodeDisplay.getText();

        return fullText;
    }

    /**
     * Interacts with the UI to visit the admin configuration view of Spot-TV.
     *
     * @returns {void}
     */
    async goToAdminPage(): Promise<void> {
        const adminSettingsButtons = await this.select(ADMIN_SETTINGS_BUTTON);

        await adminSettingsButtons.waitForExist();
        await adminSettingsButtons.moveTo();
        await adminSettingsButtons.waitForDisplayed();
        await adminSettingsButtons.click();
    }

    /**
     * Proceeds directly to the calendar view of Spot-TV.
     *
     * @param queryParams - Query parameters to add to the URL.
     * @param visibilityWait - Override for how long page load should
     * wait for before reporting the page as having failed to load. If -1 is passed then the waiting part will be
     * skipped.
     * @returns {void}
     */
    async visit(queryParams?: Map<string, unknown>, visibilityWait?: number): Promise<void> {
        let calendarPageUrl = constants.SPOT_URL;

        if (queryParams) {
            calendarPageUrl += '?';

            for (const [ key, value ] of queryParams) {
                calendarPageUrl += `${key}=${value}&`;
            }
        }

        await this._browser.url(calendarPageUrl);

        if (visibilityWait !== -1) {
            await this.waitForVisible(visibilityWait);
        }
    }
}

export default CalendarPage;
