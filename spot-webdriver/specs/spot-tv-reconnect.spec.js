const spotSessionStore = require('../user/spotSessionStore');

describe('The reconnect logic', () => {
    const session = spotSessionStore.createSession();

    describe('when the internet goes offline', () => {
        it('in the backend mode Spot TV and permanent remote will both reconnect', () => {
            if (!session.isBackendEnabled()) {
                pending();

                return;
            }

            session.startSpotTv();
            session.startPermanentSpotRemote();

            const tv = session.getSpotTV();
            const remote = session.getSpotRemote();

            tv.setNetworkOffline();
            remote.setNetworkOffline();

            tv.getLoadingScreen().waitForReconnectingToAppear();
            remote.getLoadingScreen().waitForLoadingToAppear();
            remote.getLoadingScreen().waitForReconnectingToAppear();

            tv.setNetworkOnline();
            remote.setNetworkOnline();

            remote.getLoadingScreen().waitForLoadingToDisappear();

            // Spot TV needs more time, because of the MUC JID conflict
            tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);

            remote.getRemoteControlPage().waitWaitingForCallViewToDisplay();
        });

        it('Spot TV will reconnect, but temporary remote will go back to the join code entry page', () => {
            const tv = session.getSpotTV();
            const remote = session.getSpotRemote();

            session.connectRemoteToTV();

            tv.setNetworkOffline();
            remote.setNetworkOffline();

            tv.getLoadingScreen().waitForReconnectingToAppear();

            // Temporary remote is supposed to go back to the join code entry page
            remote.getJoinCodePage().waitForVisible(30 * 1000);

            tv.setNetworkOnline();
            remote.setNetworkOnline();

            // Spot TV needs more time, because of the MUC JID conflict
            tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);
        });

        it('does not disconnect the TV from the meeting', () => {
            const tv = session.getSpotTV();
            const remote = session.getSpotRemote();

            session.connectRemoteToTV();

            session.joinMeeting();

            remote.getInMeetingPage().waitForVisible();
            tv.getMeetingPage().waitForMeetingJoined();

            tv.setNetworkOffline();

            tv.getLoadingScreen().waitForReconnectingToAppear();
            expect(tv.getMeetingPage().isDisplayingMeeting()).toBe(true);

            tv.setNetworkOnline();

            tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);
            expect(tv.getMeetingPage().isDisplayingMeeting()).toBe(true);
        });
    });
});
