const spotSessionStore = require('../user/spotSessionStore');

describe('A Spot-Remote can connect to a Spot-TV', () => {
    const session = spotSessionStore.createSession();
    const spotRemote = session.getSpotRemote();

    it('using a code', () => {
        session.connectRemoteToTV();
    });

    describe('but when the code is invalid', () => {
        it('an error notification is displayed', () => {
            const joinCodePage = spotRemote.getJoinCodePage();

            joinCodePage.visit();
            joinCodePage.enterCode('0');
            joinCodePage.submitCode();

            spotRemote.getNotifications().waitForErrorToDisplay();
        });
    });
});
