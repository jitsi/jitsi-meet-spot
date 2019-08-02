const SpotSession = require('../user/spot-session');

describe('A Spot-Remote can connect to a Spot-TV', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();

    it('using a code', () => {
        const session = new SpotSession(spotTV, spotRemote);

        session.connectRemoteToTV();
        session.forceDisconnectSpotRemote();
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
