import * as constants from '../constants/index.js';
import SpotSession from '../user/spot-session.js';
import SpotTV from '../user/spot-tv-user.js';
import type SpotRemote from '../user/spot-remote-user.js';

describe('The Spot TV conflict detection logic', () => {
    it('should notify of the conflict and recover once the other Spot-TV leaves', async (): Promise<void> => {
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

        // Spot 2 cannot join because Spot 1 already holds the room, so it shows an
        // error notification while it keeps retrying the join in the background.
        await spotTv2.getNotifications().waitForErrorToDisplay();

        // Once the original Spot-TV leaves, Spot 2's background retry succeeds and it
        // recovers to the calendar (home) view on its own — there is no manual retry.
        await spotTv1.cleanup();

        await spotTv2.getCalendarPage().waitForVisible();

        // In backend mode every TV resolves to the same backend room/MUC, so leave none behind:
        // an un-cleaned Spot 2 would still occupy the shared room and trip the conflict-retry
        // path on the next spec's Spot-TV.
        await spotTv2.cleanup();
    });
});
