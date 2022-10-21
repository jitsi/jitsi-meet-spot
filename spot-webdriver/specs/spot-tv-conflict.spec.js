const SpotTV = require('../user/spot-tv-user');
const SpotSession = require('../user/spot-session');
const constants = require('../constants');

/**
 * For this test, it's needed backend enabled in order to have the conflict page (isBackendEnabled).
 *
 * // TODO - this test fails for the moment
 * 1.update conflict page to use id/class (now: [data-qa-id=conflict-view])
 * as webdriverio does not work anymore with tags
// 2. In order to fix it, add the needed config changes to have nacle.
 */
describe('The Spot TV conflict detection logic', () => {
    it('should detect the conflict after timeout and allow to retry', async () => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        const spotTv1 = new SpotTV(constants.SPOT_BROWSER);

        const spotTv2 = new SpotTV(constants.REMOTE_CONTROL_BROWSER);

        const spotSession1 = new SpotSession(spotTv1, undefined);

        const spotSession2 = new SpotSession(spotTv2, undefined);

        await spotSession1.startSpotTv();

        await spotSession2.startSpotTv(true);

        const conflictPage = spotTv2.getConflictPage();

        await conflictPage.waitForVisible();

        await spotTv1.cleanup();

        await conflictPage.clickRetry();

        await spotTv2.getCalendarPage().waitForVisible();
    });
});
