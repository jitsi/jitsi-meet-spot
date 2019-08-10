const spotSessionStore = require('../user/spotSessionStore');

describe('Can start a meeting', () => {
    const session = spotSessionStore.createSession();

    beforeEach(() => {
        session.connectRemoteToTV();
    });

    it('with any name', () => {
        const spotTV = session.getSpotTV();
        const testMeetingName = session.joinMeeting();

        expect(spotTV.getMeetingName()).toBe(testMeetingName);
    });
});
