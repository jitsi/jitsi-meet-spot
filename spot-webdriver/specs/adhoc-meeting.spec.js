const spotSessionStore = require('../user/spotSessionStore');

describe('Can start a meeting', () => {
    const session = spotSessionStore.createSession();

    beforeEach(() => {
        session.connectRemoteToTV();
    });

    it('with any name', () => {
        const spotTV = session.getSpotTV();
        const testMeetingName = session.joinMeeting();

        expect(spotTV.getMeetingName()).toBe(testMeetingName);
    });

    xit('and disconnects the remote on meeting end', () => {
        if (!session.isBackendEnabled()) {
            pending();

            return;
        }

        const spotTV = session.getSpotTV();
        const spotRemote = session.getSpotRemote();

        session.joinMeeting();

        spotTV.getMeetingPage().waitForVisible();

        const inMeetingPage = spotRemote.getInMeetingPage();

        inMeetingPage.waitForVisible();
        inMeetingPage.hangUp();
        inMeetingPage.skipFeedback();

        spotRemote.getJoinCodePage().waitForVisible();
    });
});
