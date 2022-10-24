const SpotSession = require('../user/spot-session');
const spotSessionStore = require('../user/spotSessionStore');

describe('Can start a meeting', () => {
    const session = spotSessionStore.createSession();

    beforeEach(async () => {
        await session.connectRemoteToTV();
    });

    it('with any name', async () => {
        const spotTV = session.getSpotTV();
        const testMeetingName = await session.joinMeeting();

        expect(await spotTV.getMeetingName()).toBe(testMeetingName);
    });

    it('and cancel join', async () => {
        const spotTV = session.getSpotTV();
        const spotRemote = session.getSpotRemote();
        const inMeetingPage = spotRemote.getInMeetingPage();

        // Go to an invalid meeting url, but a url that has a whitelisted domain,
        // to prevent any meeting loaded confirmation from firing and to make
        // the cancel button display.
        await session.joinMeeting('https://meet.jit.si/config.js', { skipJoinVerification: true });

        await inMeetingPage.waitForCancelMeetingToDisplay();
        await inMeetingPage.cancelMeetingJoin();

        await spotTV.getCalendarPage().waitForVisible();
    });

    it('prevents trying to join a non-whitelisted url', async () => {
        const spotTV = session.getSpotTV();

        // Go to an invalid meeting url, but a url that has a whitelisted domain,
        // to prevent any meeting loaded confirmation from firing and to make
        // the cancel button display.
        await session.joinMeeting('https://something.invalid1234.com/meeting12323');

        await spotTV.getNotifications().waitForErrorToDisplay();

        await spotTV.getCalendarPage().waitForVisible();
    });

    xit('and disconnects the remote on meeting end', () => {
        if (!SpotSession.isBackendEnabled()) {
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
