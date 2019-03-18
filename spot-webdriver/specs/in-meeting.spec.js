const SpotSession = require('../user/spot-session');

describe('While in a meeting ', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();
    const spotSession = new SpotSession(spotTV, spotRemote);

    beforeEach(() => {
        spotSession.connectRemoteToTV();
        spotSession.joinMeeting();
        spotRemote
            .getInMeetingPage()
            .waitForVisible();
    });

    it('can toggle audio mute', () => {
        const inMeetingPage = spotRemote.getInMeetingPage();

        inMeetingPage.muteAudio();

        inMeetingPage.waitForAudioMutedStateToBe(true);

        inMeetingPage.unmuteAudio();

        inMeetingPage.waitForAudioMutedStateToBe(false);
    });

    it('can toggle video mute', () => {
        const inMeetingPage = spotRemote.getInMeetingPage();

        inMeetingPage.muteVideo();

        inMeetingPage.waitForVideoMutedStateToBe(true);

        inMeetingPage.unmuteVideo();

        inMeetingPage.waitForVideoMutedStateToBe(false);
    });
});
