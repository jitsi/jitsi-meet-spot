const remoteControlConnect = require('../flow-utils/remote-control-connect');

describe('A Spot-Remote can screenshare wirelessly', () => {
    const userFactory = require('../user/user-factory');
    const spotUser = userFactory.getSpotUser();
    const remoteControlUser = userFactory.getRemoteControlUser();

    beforeEach(() => {
        remoteControlConnect(spotUser, remoteControlUser);
    });

    describe('with no wired screenshare setup', () => {
        it('from the waiting screen', () => {
            const remoteControlPage = remoteControlUser.getRemoteControlPage();

            remoteControlPage.waitForVisible();

            remoteControlPage.startWirelessScreenshare();

            const meetingPage = spotUser.getMeetingPage();

            meetingPage.waitForVisible();
            meetingPage.waitForMeetingJoined();

            const inMeetingPage = remoteControlUser.getInMeetingPage();

            inMeetingPage.waitForScreensharingStateToBe(true);
            inMeetingPage.stopScreensharing();
            inMeetingPage.waitForScreensharingStateToBe(false);
        });
    });
});
