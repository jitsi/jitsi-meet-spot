describe('Can start a meeting of any name', () => {
    const userFactory = require('../user/user-factory');
    const user = userFactory.getUser();

    beforeEach(() => {
        const calendarPage = user.getCalendarPage();

        calendarPage.visit();
    });

    afterEach(() => {
        user.closeAnyRemoteControls();
    });

    it('from calendar view', () => {
        const calendarPage = user.getCalendarPage();
        const meetingInput = calendarPage.getMeetingInput();
        const testMeetingName = `ui-test-${Date.now()}`;

        meetingInput.submitMeetingName(testMeetingName);

        const meetingPage = user.getMeetingPage();

        meetingPage.waitForVisible();

        expect(meetingPage.getMeetingName()).toBe(testMeetingName);
    });

    it('from the remote control', () => {
        const calendarPage = user.getCalendarPage();
        const remoteControlId = calendarPage.openRemoteControl();

        user.focusOnTabWithId(remoteControlId);

        const remoteControlPage = user.getRemoteControlPage();

        remoteControlPage.waitForVisible();

        const testMeetingName = `ui-test-${Date.now()}`;
        const meetingInput = remoteControlPage.getMeetingInput();

        meetingInput.submitMeetingName(testMeetingName);

        user.focusOnStartingTab();

        const meetingPage = user.getMeetingPage();

        meetingPage.waitForVisible();

        expect(meetingPage.getMeetingName()).toBe(testMeetingName);
    });
});
