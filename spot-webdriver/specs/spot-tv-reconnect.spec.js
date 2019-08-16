const spotSessionStore = require('../user/spotSessionStore');

describe('The reconnect logic', () => {
    const session = spotSessionStore.createSession();

    beforeEach(() => {
        session.connectRemoteToTV();
    });

    it('show/hides reconnect overlay when the internet goes offline', () => {
        const tv = session.getSpotTV();
        const remote = session.getSpotRemote();

        tv.setNetworkOffline();
        remote.setNetworkOffline();

        tv.getReconnectOverlay().waitForOverlayToAppear();
        remote.getReconnectOverlay().waitForOverlayToAppear();

        tv.setNetworkOnline();
        remote.setNetworkOnline();

        remote.getReconnectOverlay().waitForOverlayToDisappear();

        // Spot TV needs more time, because of the MUC JID conflict
        tv.getReconnectOverlay().waitForOverlayToDisappear(90 * 1000);
    });
});
