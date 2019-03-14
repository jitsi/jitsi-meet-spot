const remoteControlConnect = require('../flow-utils/remote-control-connect');

describe('Can start a meeting of any name', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();

    beforeEach(() => {
        remoteControlConnect(spotTV, spotRemote);
    });

    it('from the remote control', () => {
        const remoteControlPage = spotRemote.getRemoteControlPage();

        remoteControlPage.waitForVisible();

        const testMeetingName = `ui-test-${Date.now()}`;
        const meetingInput = remoteControlPage.getMeetingInput();

        meetingInput.submitMeetingName(testMeetingName);

        const meetingPage = spotTV.getMeetingPage();

        meetingPage.waitForVisible();

        expect(meetingPage.getMeetingName()).toBe(testMeetingName);
    });
});
