const SpotSession = require('../user/spot-session');

describe('Can start a meeting of any name', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();
    const session = new SpotSession(spotTV, spotRemote);

    beforeEach(() => {
        session.connectRemoteToTV();
    });

    it('from the remote control', () => {
        const testMeetingName = session.joinMeeting();

        expect(spotTV.getMeetingName()).toBe(testMeetingName);
    });
});
