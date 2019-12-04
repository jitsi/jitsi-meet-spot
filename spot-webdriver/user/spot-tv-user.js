const AdminPage = require('../page-objects/admin-page');
const CalendarPage = require('../page-objects/calendar-page');
const MeetingPage = require('../page-objects/meeting-page');
const SpotUser = require('./spot-user');

/**
 * A model wrapping a browser driver that represents a Spot-TV which is the main screen in
 * a conference room.
 */
class SpotTV extends SpotUser {
    /**
     * Initializes a new {@code SpotTV} instance.
     *
     * @inheritdoc
     */
    constructor(driver) {
        super(driver, 'remoteControlServer');

        this.adminPage = new AdminPage(this.driver);
        this.calendarPage = new CalendarPage(this.driver);
        this.meetingPage = new MeetingPage(this.driver);
    }

    /**
     * Disconnects the remote control service.
     *
     * @returns {void}
     */
    disconnectRemoteControlService() {
        this.driver.executeAsync(done => {
            try {
                window.spot.remoteControlServer.disconnect()
                    .then(done, done);
            } catch (e) {
                done();
            }
        });
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
     * Retrieves the short lived pairing code displayed on the calendar page.
     *
     * @returns {string}
     */
    getShortLivedPairingCode() {
        return this.getCalendarPage().getJoinCode();
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
