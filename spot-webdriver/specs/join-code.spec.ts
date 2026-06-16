import spotSessionStore from '../user/spotSessionStore.js';

describe('A Spot-Remote can connect to a Spot-TV', () => {
    const session = spotSessionStore.createSession();
    const spotRemote = session.getSpotRemote();

    it('should manage to retrieve a join code of 6 characters', async (): Promise<void> => {
        // Drive the TV through the session (rather than a raw `browser.url('/tv')`) so the
        // backend refresh token is supplied in backend mode — otherwise the TV never pairs,
        // never joins the MUC, and never renders a join code. In open-source mode the param is
        // empty and the TV auto-connects exactly as before.
        await session.startSpotTv();

        const joinCode = await session.getSpotTV().getShortLivedPairingCode();

        expect(joinCode.length).toBe(6);
    });

    it('using a code', async (): Promise<void> => {
        await session.connectRemoteToTV();
    });

    describe('but when the code is invalid', () => {
        it('an error notification is displayed', async (): Promise<void> => {
            const joinCodePage = spotRemote.getJoinCodePage();

            await joinCodePage.visit();
            await joinCodePage.enterCode('5');
            await joinCodePage.submitCode();
            await spotRemote.getNotifications().waitForErrorToDisplay();
        });
    });
});
