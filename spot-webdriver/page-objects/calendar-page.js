const constants = require('../constants');
const MeetingInput = require('./meeting-input');
const PageObject = require('./page-object');

const CALENDAR_VIEW = '[data-qa-id=home-view]';
const JOIN_CODE = '[data-qa-id=join-infoss]';

/**
 * A page object for interacting with the calendar view of Spot.
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
     * Scrapes the join code necessary for a remote control to connect to Spot.
     *
     * @returns {string}
     */
    getJoinCode() {
        this.driver.waitForVisible(
            JOIN_CODE,
            constants.VISIBILITY_WAIT
        );

        const fullText = this.driver.getText(JOIN_CODE);
        const parts = fullText.split(' ');

        return parts[parts.length - 1];
    }

    /**
     * Proceeds directly to the calendar view of Spot.
     *
     * @returns {void}
     */
    visit() {
        this.driver.url(constants.SPOT_URL);
        this.waitForVisible();
    }

    /**
     * Compares the currently opened tab ids with an array of tab ids and
     * returns the difference.
     *
     * @param {Array<string>} previousTabIds - The old tab ids to compare
     * against to calculate which of the current tabs are new.
     * @private
     * @returns {Array<string>}
     */
    _getNewTabIds(previousTabIds) {
        const currentTabIds = this.driver.getTabIds();

        return currentTabIds.filter(id => !previousTabIds.includes(id));
    }
}

module.exports = CalendarPage;
