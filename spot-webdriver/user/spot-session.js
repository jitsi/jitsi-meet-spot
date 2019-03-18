/**
 * Represents a session/connection between SpotTV and SpotRemote instances.
 */
class SpotSession {
    /**
     * Initializes new {@code SpotSession} between TV and remote (there's no connection between
     * the two yet).
     *
     * @param {SpotTV} spotTV - The Spot TV instance that will be part of this session.
     * @param {SpotRemote} spotRemote - The Spot Remote instance that will be part of this session.
     */
    constructor(spotTV, spotRemote) {
        this.spotTV = spotTV;
        this.spotRemote = spotRemote;
    }

    /**
     * Obtains the join code from the {@code SpotTV} and makes the {@code SpotRemote} connect to
     * the TV using the code.
     *
     * @returns {void}
     */
    connectRemoteToTV() {
        const calendarPage = this.spotTV.getCalendarPage();

        calendarPage.visit();

        const joinCode = calendarPage.getJoinCode();

        const joinCodePage = this.spotRemote.getJoinCodePage();

        joinCodePage.visit();
        joinCodePage.submitCode(joinCode);

        const remoteControlPage = this.spotRemote.getRemoteControlPage();

        remoteControlPage.waitForVisible();
    }

    /**
     * The {@SpotRemote} makes the TV join a meeting with the given name. If a name is not provided
     * the session selects a random one.
     *
     * @param {string} [meetingName] - The name of the meeting to join (optional).
     * @returns {string} - The name of the meeting that the Spot TV tried to join.
     */
    joinMeeting(meetingName) {
        const remoteControlPage = this.spotRemote.getRemoteControlPage();

        remoteControlPage.waitForVisible();

        const testMeetingName = meetingName ? meetingName : `ui-test-${Date.now()}`;
        const meetingInput = remoteControlPage.getMeetingInput();

        meetingInput.submitMeetingName(testMeetingName);

        const meetingPage = this.spotTV.getMeetingPage();

        meetingPage.waitForVisible();

        return testMeetingName;
    }
}

module.exports = SpotSession;
