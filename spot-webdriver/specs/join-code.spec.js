const SpotSession = require('../user/spot-session');

describe('A Spot-Remote can connect to a Spot-TV', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();

    it('using a code', () => {
        new SpotSession(spotTV, spotRemote).connectRemoteToTV();
    });
});
