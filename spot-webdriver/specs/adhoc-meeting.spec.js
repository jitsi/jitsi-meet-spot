const SpotSession = require('../user/spot-session');

describe('Can start a meeting', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();
    const session = new SpotSession(spotTV, spotRemote);

    beforeEach(() => {
        session.connectRemoteToTV();
    });

    afterEach(() => {
        session.resetConnection();
    });

    it('with any name', () => {
        const testMeetingName = session.joinMeeting();

        expect(spotTV.getMeetingName()).toBe(testMeetingName);
    });
});
