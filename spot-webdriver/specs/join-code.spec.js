const spotSessionStore = require('../user/spotSessionStore');

describe('A Spot-Remote can connect to a Spot-TV', () => {
    const session = spotSessionStore.createSession();
    const spotRemote = session.getSpotRemote();

    it('should manage to retrieve a join code of 6 characters', async () => {
        await browser.url('http://localhost:8000/tv');

        const joinCode = await browser.$('.setup-join-code .join-code');

        await joinCode.waitForExist();
        const joinCodeTextEl = await joinCode.getText();
        const text = Array.isArray(joinCodeTextEl) ? joinCodeTextEl[0] : joinCodeTextEl;

        expect(text.length).toBe(6);
    });

    it('using a code', async () => {
        await session.connectRemoteToTV();
    });

    describe('but when the code is invalid', () => {
        it('an error notification is displayed', async () => {
            const joinCodePage = spotRemote.getJoinCodePage();

            await joinCodePage.visit();
            await joinCodePage.enterCode('5');
            await joinCodePage.submitCode();
            await spotRemote.getNotifications().waitForErrorToDisplay();
        });
    });
});
