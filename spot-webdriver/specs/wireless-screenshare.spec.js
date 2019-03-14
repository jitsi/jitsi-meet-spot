const remoteControlConnect = require('../flow-utils/remote-control-connect');

describe('A Spot-Remote can screenshare wirelessly', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();

    beforeEach(() => {
        remoteControlConnect(spotTV, spotRemote);
    });

    describe('with no wired screenshare setup', () => {
        it('from the waiting screen', () => {
            const remoteControlPage = spotRemote.getRemoteControlPage();

            remoteControlPage.waitForVisible();

            remoteControlPage.startWirelessScreenshare();

            const meetingPage = spotTV.getMeetingPage();

            meetingPage.waitForVisible();
            meetingPage.waitForMeetingJoined();

            const inMeetingPage = spotRemote.getInMeetingPage();

            inMeetingPage.waitForScreensharingStateToBe(true);
            inMeetingPage.stopScreensharing();
            inMeetingPage.waitForScreensharingStateToBe(false);
        });
    });
});
