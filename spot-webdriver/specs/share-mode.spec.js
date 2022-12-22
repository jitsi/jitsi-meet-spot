const SpotSession = require('../user/spot-session');
const spotSessionStore = require('../user/spotSessionStore');

xdescribe('In share mode', () => {
    const session = spotSessionStore.createSession();
    const spotTV = session.getSpotTV();
    const spotRemote = session.getSpotRemote();

    beforeEach(async () => {
        // Remote joins automatically in share mode
        await session.connectScreeshareOnlyRemoteToTV();

        const stopSharePage = spotRemote.getStopSharePage();

        await stopSharePage.waitForVisible(20000);
    });

    it('Spot-Remote automatically starts sharing on connection', async () => {
        const meetingPage = spotTV.getMeetingPage();

        await meetingPage.waitForMeetingJoined();

        const stopSharePage = spotRemote.getStopSharePage();

        await stopSharePage.stopScreensharing();
    });

    it('Spot-Remote can enter full remote control mode', async () => {
        if (SpotSession.isBackendEnabled()) {
            pending();

            // In the backend mode remote gets disconnected so it doesn't get to the full remote control mode.
            return;
        }

        const stopSharePage = spotRemote.getStopSharePage();

        await stopSharePage.stopScreensharing();

        const modeSelectPage = spotRemote.getModeSelectPage();

        await modeSelectPage.waitForVisible();

        await modeSelectPage.selectFullRemoteControlMode();

        const remoteControlPage = spotRemote.getRemoteControlPage();

        await remoteControlPage.waitForVisible();

        await remoteControlPage.waitWaitingForCallViewToDisplay();
    });

    it('Spot-Remote is disconnected on share end', async () => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        const meetingPage = spotTV.getMeetingPage();

        await meetingPage.waitForMeetingJoined();

        const stopSharePage = spotRemote.getStopSharePage();

        await stopSharePage.stopScreensharing();

        const joinCodePage = spotRemote.getJoinCodePage();

        await joinCodePage.waitForVisible();
    });
});
