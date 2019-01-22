const remoteControlConnect = require('../flow-utils/remote-control-connect');

describe('Can start a meeting of any name', () => {
    const userFactory = require('../user/user-factory');
    const spotUser = userFactory.getSpotUser();
    const remoteControlUser = userFactory.getRemoteControlUser();

    beforeEach(() => {
        remoteControlConnect(spotUser, remoteControlUser);
    });

    it('from the remote control', () => {
        const remoteControlPage = remoteControlUser.getRemoteControlPage();

        remoteControlPage.waitForVisible();

        const testMeetingName = `ui-test-${Date.now()}`;
        const meetingInput = remoteControlPage.getMeetingInput();

        meetingInput.submitMeetingName(testMeetingName);

        const meetingPage = spotUser.getMeetingPage();

        meetingPage.waitForVisible();

        expect(meetingPage.getMeetingName()).toBe(testMeetingName);
    });
});
