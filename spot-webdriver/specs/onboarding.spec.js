describe('A Spot-Remote new user onboarding', () => {
    const userFactory = require('../user/user-factory');
    const spotRemote = userFactory.getSpotRemote();

    describe('at the join code page', () => {
        it('shows if the query param is present', () => {
            spotRemote.getJoinCodePage().visitWithOnboarding();
            spotRemote.getHelpPage().waitForVisible();
        });

        it('does not show if the query param is present', () => {
            const joinCodePage = spotRemote.getJoinCodePage();

            joinCodePage.visit();
            joinCodePage.waitForVisible();
        });

        it('does not show if already completed', () => {
            const joinCodePage = spotRemote.getJoinCodePage();
            const helpPage = spotRemote.getHelpPage();

            joinCodePage.visitWithOnboarding();
            helpPage.waitForVisible();
            helpPage.exit();

            joinCodePage.waitForVisible();
            joinCodePage.visitWithOnboarding();
            joinCodePage.waitForVisible();
        });
    });
});
