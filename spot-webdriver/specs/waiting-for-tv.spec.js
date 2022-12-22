const SpotSession = require('../user/spot-session');
const spotSessionStore = require('../user/spotSessionStore');

describe('The "waiting for the Spot TV to connect" message', () => {
    const session = spotSessionStore.createSession();

    it('should appear if no Spot TV and disappear when it connects', async () => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        await session.startSpotTv();

        const joinCode = await session.getSpotTV().getShortLivedPairingCode();

        session.getSpotTV().stop();

        const remote = session.getSpotRemote();

        await session.startSpotRemote(joinCode);

        const waitingForSpotTvLabel = remote.getRemoteControlPage().getWaitingForSpotTvLabel();

        await waitingForSpotTvLabel.waitForVisible();

        await session.startSpotTv();

        await waitingForSpotTvLabel.waitForHidden();
    });

    it('should appear if Spot TV disconnects while Spot Remote is disconnected', async () => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        await session.startSpotTv();
        await session.startPermanentSpotRemote();

        const remote = session.getSpotRemote();

        await remote.setNetworkOffline();
        await remote.stopP2PConnection();

        await remote.getLoadingScreen().waitForLoadingToAppear();

        await session.getSpotTV().stop();

        await remote.setNetworkOnline();
        const spotTvLabelEl = await remote.getRemoteControlPage().getWaitingForSpotTvLabel();

        await spotTvLabelEl.waitForVisible();
    });
});
