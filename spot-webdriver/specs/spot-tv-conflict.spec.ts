import * as constants from '../constants/index.js';
import SpotSession from '../user/spot-session.js';
import SpotTV from '../user/spot-tv-user.js';
import type SpotRemote from '../user/spot-remote-user.js';

describe('The Spot TV conflict detection logic', () => {
    it('should detect the conflict after timeout and allow to retry', async (): Promise<void> => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        const spotTv1 = new SpotTV(constants.SPOT_BROWSER);

        const spotTv2 = new SpotTV(constants.REMOTE_CONTROL_BROWSER);

        const spotSession1 = new SpotSession(spotTv1, undefined as unknown as SpotRemote);

        const spotSession2 = new SpotSession(spotTv2, undefined as unknown as SpotRemote);

        await spotSession1.startSpotTv();

        await spotSession2.startSpotTv(true);

        // TODO: check if the notification is displayed in Spot 2

        await spotTv1.cleanup();

        // @ts-expect-error conflictPage page-object is not implemented (pre-existing)
        await conflictPage.clickRetry();

        await spotTv2.getCalendarPage().waitForVisible();
    });
});
