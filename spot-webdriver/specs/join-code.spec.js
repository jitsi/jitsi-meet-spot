const remoteControlConnect = require('../flow-utils/remote-control-connect');

describe('A remote can connect to a Spot', () => {
    const userFactory = require('../user/user-factory');
    const spotUser = userFactory.getSpotUser();
    const remoteControlUser = userFactory.getRemoteControlUser();

    it('from the remote control', () => {
        remoteControlConnect(spotUser, remoteControlUser);
    });
});
