const CalendarPage = require('../page-objects/calendar-page');
const JoinCodePage = require('../page-objects/join-code-page');
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
     * @inheritdoc
     */
    constructor(driver) {
        this.driver = driver;

        this.calendarPage = new CalendarPage(this.driver);
        this.joinCodePage = new JoinCodePage(this.driver);
        this.meetingPage = new MeetingPage(this.driver);
        this.remoteControlPage = new RemoteControlPage(this.driver);
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
     * Returns an instance of {@code JoinCodePage} which wraps interactions with
     * the join code view in the remote control.
     *
     * @returns {JoinCodePage}
     */
    getJoinCodePage() {
        return this.joinCodePage;
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
