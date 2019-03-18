const SpotSession = require('../user/spot-session');

describe('A remote can connect to a Spot', () => {
    const userFactory = require('../user/user-factory');
    const spotTV = userFactory.getSpotTV();
    const spotRemote = userFactory.getSpotRemote();

    it('from the remote control', () => {
        new SpotSession(spotTV, spotRemote).connectRemoteToTV();
    });
});
