import type { BrowserName } from '../constants/index.js';
import AdminPage from '../page-objects/admin-page.js';
import CalendarPage from '../page-objects/calendar-page.js';
import MeetingPage from '../page-objects/meeting-page.js';

import SpotUser from './spot-user.js';

/**
 * A model wrapping a browser driver that represents a Spot-TV which is the main screen in
 * a conference room.
 */
class SpotTV extends SpotUser {
    adminPage: AdminPage;
    calendarPage: CalendarPage;
    meetingPage: MeetingPage;

    /**
     * Initializes a new {@code SpotTV} instance.
     *
     * @inheritdoc
     */
    constructor(driver: BrowserName) {
        super(driver, 'remoteControlServer');

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
    getAdminPage(): AdminPage {
        return this.adminPage;
    }

    /**
     * Returns an instance of {@code CalendarPage} which wraps interactions with
     * the calendar view in Spot-TV.
     *
     * @returns {CalendarPage}
     */
    getCalendarPage(): CalendarPage {
        return this.calendarPage;
    }

    /**
     * Waits for the meeting page to be displayed and obtains the name of the
     * meeting that this Spot-TV instance is currently in.
     *
     * @returns {string}
     */
    async getMeetingName(): Promise<string | undefined> {
        const meetingPage = this.getMeetingPage();

        await meetingPage.waitForVisible();

        return meetingPage.getMeetingName();
    }

    /**
     * Retrieves the short lived pairing code displayed on the calendar page.
     *
     * @returns {string}
     */
    async getShortLivedPairingCode(): Promise<string> {
        const calendarPage = this.getCalendarPage();

        return await calendarPage.getJoinCode();
    }

    /**
     * Returns an instance of {@code MeetingPage} which wraps interactions with
     * the in-meeting view in Spot-TV.
     *
     * @returns {MeetingPage}
     */
    getMeetingPage(): MeetingPage {
        return this.meetingPage;
    }
}

export default SpotTV;
