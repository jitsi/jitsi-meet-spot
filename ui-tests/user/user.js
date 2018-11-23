const CalendarPage = require('../page-objects/calendar-page');
const MeetingPage = require('../page-objects/meeting-page');
const RemoteControlPage = require('../page-objects/remote-control-page');

/**
 * A model wrapping a browser driver that can interact with the Spot
 * application and exposes methods that are Spot-domain specific.
 */
class User {
    /**
     * Initializes a new {@code User} instance.
     *
     * @param {Object} driver - The webdriver.io browser instance which can
     * interact with Spot.
     */
    constructor(driver) {
        this.driver = driver;

        this.calendarPage = new CalendarPage(this.driver);
        this.meetingPage = new MeetingPage(this.driver);
        this.remoteControlPage = new RemoteControlPage(this.driver);

        this.driver.getCurrentTabId()
            .then(tabId => {
                this.startTab = tabId;
            });
    }

    /**
     * Closes all tabs or windows opened by the user expect the one which should
     * be displaying Spot.
     *
     * @returns {void}
     */
    closeAnyRemoteControls() {
        const tabsAfterClick = this.driver.getTabIds();

        tabsAfterClick.forEach(tabId => {
            if (tabId === this.startTab) {
                return;
            }

            this.driver.switchTab(tabId);
            this.driver.close(this.startTab);
        });
    }

    /**
     * Switches focus onto the tab with the Spot instance.
     *
     * @returns {void}
     */
    focusOnStartingTab() {
        this.focusOnTabWithId(this.startTab);
    }

    /**
     * Switches driver focus onto the tab with the specified id so any further
     * driver actions will take place in the context of that tab.
     *
     * @param {string} tabId - The tab to focus on.
     * @returns {void}
     */
    focusOnTabWithId(tabId) {
        this.driver.waitUntil(() => {
            this.driver.switchTab(tabId);

            return this.driver.getCurrentTabId() === tabId;
        }, 3000, 'Failed to switch driver focus');
    }

    /**
     * Returns an instance of {@code CalendarPage} which wraps interactions with
     * the calendar view in Spot.
     *
     * @returns {CalendarPage}
     */
    getCalendarPage() {
        return this.calendarPage;
    }

    /**
     * Returns an instance of {@code MeetingPage} which wraps interactions with
     * the in-meeting view in Spot.
     *
     * @returns {MeetingPage}
     */
    getMeetingPage() {
        return this.meetingPage;
    }

    /**
     * Returns an instance of {@code RemoteControlPage} which wraps interactions
     * with the remote control view in Spot.
     *
     * @returns {RemoteControlPage}
     */
    getRemoteControlPage() {
        return this.remoteControlPage;
    }
}

module.exports = User;
