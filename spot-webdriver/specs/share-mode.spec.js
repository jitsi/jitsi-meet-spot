const SpotSession = require('../user/spot-session');
const userFactory = require('../user/user-factory');

describe('In screenshare-only mode', () => {
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();
    const spotSession = new SpotSession(spotTV, spotRemote);

    beforeEach(() => {
        spotSession.connectScreeshareOnlyRemoteToTV();

        const stopSharePage = spotRemote.getStopSharePage();

        stopSharePage.waitForVisible();
    });

    it('Spot-Remote automatically starts sharing on connection', () => {
        const meetingPage = spotTV.getMeetingPage();

        meetingPage.waitForMeetingJoined();

        const stopSharePage = spotRemote.getStopSharePage();

        stopSharePage.stopScreensharing();

        const modeSelectPage = spotRemote.getModeSelectPage();

        modeSelectPage.waitForVisible();

        const calendarPage = spotTV.getCalendarPage();

        calendarPage.waitForVisible();
    });

    it('Spot-Remote can enter full remote control mode', () => {
        const stopSharePage = spotRemote.getStopSharePage();

        stopSharePage.stopScreensharing();

        const modeSelectPage = spotRemote.getModeSelectPage();

        modeSelectPage.waitForVisible();

        modeSelectPage.selectFullRemoteControlMode();

        const remoteControlPage = spotRemote.getRemoteControlPage();

        remoteControlPage.waitForVisible();
    });
});
