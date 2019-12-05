/* global remoteControlBrowser, spotBrowser */
const SpotTV = require('../user/spot-tv-user');
const SpotSession = require('../user/spot-session');

describe('The Spot TV conflict detection logic', () => {
    it('should detect the conflict after timeout and allow to retry', () => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        const spotTv1 = new SpotTV(spotBrowser);
        const spotTv2 = new SpotTV(remoteControlBrowser);

        const spotSession1 = new SpotSession(spotTv1, undefined);
        const spotSession2 = new SpotSession(spotTv2, undefined);

        spotSession1.startSpotTv();

        spotSession2.startSpotTv(false);

        const conflictPage = spotTv2.getConflictPage();

        conflictPage.waitForVisible();

        spotTv1.cleanup();

        conflictPage.clickRetry();

        spotTv2.getCalendarPage().waitForVisible();
    });
});
