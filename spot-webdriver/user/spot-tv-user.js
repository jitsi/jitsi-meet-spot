const CalendarPage = require('../page-objects/calendar-page');
const MeetingPage = require('../page-objects/meeting-page');

/**
 * A model wrapping a browser driver that represents a Spot TV which is the main screen in
 * a conference room.
 */
class SpotTV {
    /**
     * Initializes a new {@code User} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        this.driver = driver;

        this.calendarPage = new CalendarPage(this.driver);
        this.meetingPage = new MeetingPage(this.driver);
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
}

module.exports = SpotTV;
