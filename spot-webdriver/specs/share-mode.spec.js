const spotSessionStore = require('../user/spotSessionStore');

describe('In share mode', () => {
    const session = spotSessionStore.createSession();
    const spotTV = session.getSpotTV();
    const spotRemote = session.getSpotRemote();

    beforeEach(() => {
        session.connectScreeshareOnlyRemoteToTV();

        const stopSharePage = spotRemote.getStopSharePage();

        stopSharePage.waitForVisible();
    });

    it('Spot-Remote automatically starts sharing on connection', () => {
        const meetingPage = spotTV.getMeetingPage();

        meetingPage.waitForMeetingJoined();

        const stopSharePage = spotRemote.getStopSharePage();

        stopSharePage.stopScreensharing();
    });

    xit('Spot-Remote is disconnected on share end', () => {
        if (!session.isBackendEnabled()) {
            pending();

            return;
        }

        const meetingPage = spotTV.getMeetingPage();

        meetingPage.waitForMeetingJoined();

        const stopSharePage = spotRemote.getStopSharePage();

        stopSharePage.stopScreensharing();

        const joinCodePage = spotRemote.getJoinCodePage();

        joinCodePage.waitForVisible();
    });
});
