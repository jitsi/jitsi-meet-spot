const spotSessionStore = require('../user/spotSessionStore');

describe('While in a meeting ', () => {
    const session = spotSessionStore.createSession();
    const spotTV = session.getSpotTV();
    const spotRemote = session.getSpotRemote();

    beforeEach(async () => {
        await session.connectRemoteToTV();
        await session.joinMeeting('', { skipJoinVerification: true });
        await spotRemote
            .getInMeetingPage()
            .waitForVisible(15000);
    });

    it('can toggle audio mute', async () => {
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();

        await spotRemoteInMeetingPage.muteAudio();
        console.log('Bogdan toggle after muteAudio');

        await spotRemoteInMeetingPage.waitForAudioMutedStateToBe(true);
        await spotTVMeetingPage.waitForAudioMutedStateToBe(true);

        await spotRemoteInMeetingPage.unmuteAudio();

        await spotRemoteInMeetingPage.waitForAudioMutedStateToBe(false);
        await spotTVMeetingPage.waitForAudioMutedStateToBe(false);
    });

    it('can toggle video mute', async () => {
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();

        await spotRemoteInMeetingPage.muteVideo();

        await spotRemoteInMeetingPage.waitForVideoMutedStateToBe(true);
        await spotTVMeetingPage.waitForVideoMutedStateToBe(true);

        await spotRemoteInMeetingPage.unmuteVideo();

        await spotRemoteInMeetingPage.waitForVideoMutedStateToBe(false);
        await spotTVMeetingPage.waitForVideoMutedStateToBe(false);
    });

    it('can toggle tile view', async () => {
        const spotRemoteInMeetingPage = spotRemote.getInMeetingPage();
        const spotTVMeetingPage = spotTV.getMeetingPage();
        const inTileView = await spotTVMeetingPage.isInTileView();

        // The tests use the current value of inTileView to toggle instead of
        // assuming true/false in case some previous test already toggled tile
        // view and so jitsi-meet has opened with tile view already enabled.
        await spotRemoteInMeetingPage.setTileView(!inTileView);
        await spotTVMeetingPage.waitForTileViewStateToBe(!inTileView);

        spotRemoteInMeetingPage.setTileView(inTileView);
        await spotTVMeetingPage.waitForTileViewStateToBe(inTileView);
    });

    it('does not have volume control when Spot-TV is in a browser', async () => {
        expect(await spotRemote.getInMeetingPage().hasVolumeControls()).toBe(false);
    });
});
