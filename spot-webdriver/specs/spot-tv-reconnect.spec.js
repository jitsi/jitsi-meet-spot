const spotSessionStore = require('../user/spotSessionStore');

describe('The reconnect logic', () => {
    const session = spotSessionStore.createSession();

    /**
     * Helper to connect the Spot-TV to the Spot-Remote and join a meeting.
     *
     * @private
     * @returns {void}
     */
    function joinMeeting() {
        const tv = session.getSpotTV();
        const remote = session.getSpotRemote();

        session.connectRemoteToTV();

        session.joinMeeting();

        remote.getInMeetingPage().waitForVisible();
        tv.getMeetingPage().waitForMeetingJoined();
    }

    /**
     * Helper for making sure there is no connection, xmpp or p2p, to spot
     * signaling.
     *
     * @param {SpotUser} spotUser - The Spot-TV or Spot-Remote instance which
     * should disconnect from signaling.
     * @returns {void}
     */
    function disconnectFromCommunicationPlane(spotUser) {
        spotUser.setNetworkOffline();
        spotUser.waitForSignalingConnectionStopped();
        spotUser.stopP2PConnection();
    }

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

            disconnectFromCommunicationPlane(tv);
            disconnectFromCommunicationPlane(remote);

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

            disconnectFromCommunicationPlane(tv);
            disconnectFromCommunicationPlane(remote);

            tv.getLoadingScreen().waitForReconnectingToAppear();

            // Temporary remote is supposed to go back to the join code entry page
            remote.getJoinCodePage().waitForVisible(30 * 1000);

            tv.setNetworkOnline();
            remote.setNetworkOnline();

            // Spot TV needs more time, because of the MUC JID conflict
            tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);
        });

        it('does not disconnect the TV from the meeting', () => {
            joinMeeting();

            const tv = session.getSpotTV();

            disconnectFromCommunicationPlane(tv);

            tv.getLoadingScreen().waitForReconnectingToAppear();
            expect(tv.getMeetingPage().isDisplayingMeeting()).toBe(true);

            tv.setNetworkOnline();

            tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);
            expect(tv.getMeetingPage().isDisplayingMeeting()).toBe(true);
        });
    });

    describe('when signaling goes offline', () => {
        it('does not disconnect while peer-to-peer connections are active', () => {
            if (!session.isBackendEnabled()) {
                pending();

                return;
            }

            joinMeeting();

            const tv = session.getSpotTV();
            const remote = session.getSpotRemote();

            // Kill the network but allow P2P to persist.
            tv.setNetworkOffline();
            tv.waitForSignalingConnectionStopped();

            // Execute audio mute to test if the peer-to-peer connection is
            // active
            const remoteInMeetingPage = remote.getInMeetingPage();
            const tvMeetingPage = tv.getMeetingPage();

            remoteInMeetingPage.muteAudio();
            remoteInMeetingPage.waitForAudioMutedStateToBe(true);
            tvMeetingPage.waitForAudioMutedStateToBe(true);

            // Now switch signaling online and turn off p2p
            tv.setNetworkOnline();
            tv.waitForSignalingConnectionEstablished();
            tv.stopP2PConnection();

            // Execute audio unmute to check if the connection is still active.
            remoteInMeetingPage.unmuteAudio();
            remoteInMeetingPage.waitForAudioMutedStateToBe(false);
            tvMeetingPage.waitForAudioMutedStateToBe(false);
        });
    });
});
