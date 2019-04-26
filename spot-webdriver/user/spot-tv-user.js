const AdminPage = require('../page-objects/admin-page');
const CalendarPage = require('../page-objects/calendar-page');
const MeetingPage = require('../page-objects/meeting-page');

/**
 * A model wrapping a browser driver that represents a Spot-TV which is the main screen in
 * a conference room.
 */
class SpotTV {
    /**
     * Initializes a new {@code SpotTV} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        this.driver = driver;

        this.adminPage = new AdminPage(this.driver);
        this.calendarPage = new CalendarPage(this.driver);
        this.meetingPage = new MeetingPage(this.driver);
    }

    /**
     * Returns an instance of {@code Admin} which wraps interactions with
     * the admin view in Spot-TV.
     *
     * @returns {CalendarPage}
     */
    getAdminPage() {
        return this.adminPage;
    }

    /**
     * Returns an instance of {@code CalendarPage} which wraps interactions with
     * the calendar view in Spot-TV.
     *
     * @returns {CalendarPage}
     */
    getCalendarPage() {
        return this.calendarPage;
    }

    /**
     * Waits for the meeting page to be displayed and obtains the name of the
     * meeting that this Spot-TV instance is currently in.
     *
     * @returns {string}
     */
    getMeetingName() {
        const meetingPage = this.getMeetingPage();

        meetingPage.waitForVisible();

        return meetingPage.getMeetingName();
    }

    /**
     * Returns an instance of {@code MeetingPage} which wraps interactions with
     * the in-meeting view in Spot-TV.
     *
     * @returns {MeetingPage}
     */
    getMeetingPage() {
        return this.meetingPage;
    }
}

module.exports = SpotTV;
