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
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();

        spotRemoteInMeetingPage.muteAudio();

        spotRemoteInMeetingPage.waitForAudioMutedStateToBe(true);
        spotTVMeetingPage.waitForAudioMutedStateToBe(true);

        spotRemoteInMeetingPage.unmuteAudio();

        spotRemoteInMeetingPage.waitForAudioMutedStateToBe(false);
        spotTVMeetingPage.waitForAudioMutedStateToBe(false);
    });

    it('can toggle video mute', () => {
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();

        spotRemoteInMeetingPage.muteVideo();

        spotRemoteInMeetingPage.waitForVideoMutedStateToBe(true);
        spotTVMeetingPage.waitForVideoMutedStateToBe(true);

        spotRemoteInMeetingPage.unmuteVideo();

        spotRemoteInMeetingPage.waitForVideoMutedStateToBe(false);
        spotTVMeetingPage.waitForVideoMutedStateToBe(false);

    });
});
