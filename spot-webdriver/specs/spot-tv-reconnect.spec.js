const SpotSession = require('../user/spot-session');
const spotSessionStore = require('../user/spotSessionStore');

describe('The reconnect logic', () => {
    const session = spotSessionStore.createSession();

    /**
     * Helper to connect the Spot-TV to the Spot-Remote and join a meeting.
     *
     * @private
     * @returns {void}
     */
    async function joinMeeting() {
        const tv = session.getSpotTV();
        const remote = session.getSpotRemote();

        await session.connectRemoteToTV();

        await session.joinMeeting(null, { skipJoinVerification: true });

        // wait first for TV to join as remote is a bit slower (loads after tv is connected)
        await tv.getMeetingPage().waitForMeetingJoined();
        await remote.getInMeetingPage().waitForVisible();
    }

    /**
     * Helper for making sure there is no connection, xmpp or p2p, to spot
     * signaling.
     *
     * @param {SpotUser} spotUser - The Spot-TV or Spot-Remote instance which
     * should disconnect from signaling.
     * @returns {void}
     */
    async function disconnectFromCommunicationPlane(spotUser) {
        await spotUser.setNetworkOffline();
        await spotUser.waitForSignalingConnectionStopped();
        await spotUser.stopP2PConnection();
    }

    describe('when the internet goes offline', () => {
        it('in the backend mode Spot TV and permanent remote will both reconnect', async () => {
            if (!SpotSession.isBackendEnabled()) {
                pending();

                return;
            }

            await session.startSpotTv();
            await session.startPermanentSpotRemote();

            const tv = session.getSpotTV();
            const remote = session.getSpotRemote();

            await disconnectFromCommunicationPlane(tv);
            await disconnectFromCommunicationPlane(remote);

            await tv.getLoadingScreen().waitForReconnectingToAppear();
            await remote.getLoadingScreen().waitForLoadingToAppear();
            await remote.getLoadingScreen().waitForReconnectingToAppear();

            await tv.setNetworkOnline();
            await remote.setNetworkOnline();

            await remote.getLoadingScreen().waitForLoadingToDisappear();

            // Spot TV needs more time, because of the MUC JID conflict
            await tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);

            await remote.getRemoteControlPage().waitWaitingForCallViewToDisplay();
        });

        it('both Spot TV and temporary Spot Remote will reconnect', async () => {
            const tv = session.getSpotTV();
            const remote = session.getSpotRemote();

            await session.connectRemoteToTV();

            await disconnectFromCommunicationPlane(tv);

            await disconnectFromCommunicationPlane(remote);

            await tv.getLoadingScreen().waitForReconnectingToAppear();

            await tv.setNetworkOnline();
            await remote.setNetworkOnline();

            // Spot TV needs more time, because of the MUC JID conflict
            await tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);

            await remote.getRemoteControlPage().waitWaitingForCallViewToDisplay(300 * 1000);
        });

        it('does not disconnect the TV from the meeting', async () => {
            await joinMeeting();

            const tv = session.getSpotTV();

            await disconnectFromCommunicationPlane(tv);

            await tv.getLoadingScreen().waitForReconnectingToAppear();
            expect(await tv.getMeetingPage().isDisplayingMeeting()).toBe(true);

            await tv.setNetworkOnline();

            await tv.getLoadingScreen().waitForReconnectingToDisappear(100 * 1000);
            expect(await tv.getMeetingPage().isDisplayingMeeting()).toBe(true);
        });
    });

    describe('when signaling goes offline', () => {
        it('does not disconnect while peer-to-peer connections are active', async () => {
            if (!SpotSession.isBackendEnabled()) {
                pending();

                return;
            }

            await joinMeeting();

            const tv = session.getSpotTV();
            const remote = session.getSpotRemote();

            // Kill the network but allow P2P to persist.
            await tv.setNetworkOffline();
            await tv.waitForSignalingConnectionStopped();

            // Execute audio mute to test if the peer-to-peer connection is
            // active
            const remoteInMeetingPage = remote.getInMeetingPage();
            const tvMeetingPage = tv.getMeetingPage();

            await remoteInMeetingPage.muteAudio();
            await remoteInMeetingPage.waitForAudioMutedStateToBe(true);
            await tvMeetingPage.waitForAudioMutedStateToBe(true);

            // Now switch signaling online and turn off p2p
            await tv.setNetworkOnline();
            await tv.waitForSignalingConnectionEstablished();
            await tv.stopP2PConnection();

            // Execute audio unmute to check if the connection is still active.
            await remoteInMeetingPage.unmuteAudio();
            await remoteInMeetingPage.waitForAudioMutedStateToBe(false);
            await tvMeetingPage.waitForAudioMutedStateToBe(false);
        });
    });
});
