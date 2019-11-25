import P2PReconnectTrait from 'common/remote-control/P2PReconnectTrait';
import P2PSignalingClient from 'common/remote-control/P2PSignalingClient';
import XmppConnection from 'common/remote-control/xmpp-connection';
import P2PSignalingBase from 'common/remote-control/P2PSignalingBase';

describe('P2PReconnectTrait', () => {
    let p2pClient, reconnectTrait, startMock, stopMock, xmppConnection;
    const remoteAddress = 'server.org/spot-tv';

    beforeEach(() => {
        jest.useFakeTimers();

        p2pClient = new P2PSignalingClient(undefined, { getIceServers: () => [] });
        xmppConnection = new XmppConnection();
        reconnectTrait = new P2PReconnectTrait(p2pClient, xmppConnection);

        xmppConnection.isConnected = () => true;

        // eslint-disable-next-line no-empty-function
        startMock = jest.spyOn(p2pClient, 'start').mockImplementation(() => { });
        // eslint-disable-next-line no-empty-function
        stopMock = jest.spyOn(p2pClient, 'closeConnection').mockImplementation(() => { });
    });

    describe('will schedule a retry', () => {
        it('when the data channel is closed', () => {
            reconnectTrait.activate(remoteAddress);

            expect(startMock).toHaveBeenLastCalledWith(remoteAddress);
            expect(startMock).toHaveBeenCalledTimes(1);

            p2pClient.emit(P2PSignalingBase.DATA_CHANNEL_READY_UPDATE, remoteAddress, false);

            jest.advanceTimersByTime(P2PReconnectTrait.RETRY_DELAY);

            expect(startMock).toHaveBeenLastCalledWith(remoteAddress);
            expect(startMock).toHaveBeenCalledTimes(2);
        });
        it('only after the signaling comes back', () => {
            xmppConnection.isConnected = () => false;

            reconnectTrait.activate(remoteAddress);

            expect(startMock).toHaveBeenCalledTimes(0);

            jest.advanceTimersByTime(3 * P2PReconnectTrait.RETRY_DELAY);

            expect(startMock).toHaveBeenCalledTimes(0);

            xmppConnection.isConnected = () => true;
            xmppConnection.emit(XmppConnection.CONNECTED_STATE_CHANGED, true);

            expect(startMock).toHaveBeenCalledTimes(1);
        });
    });
    describe('will NOT start the connection', () => {
        it('if deactivated before signaling comes back', () => {
            xmppConnection.isConnected = () => false;

            reconnectTrait.activate(remoteAddress);

            expect(startMock).toHaveBeenCalledTimes(0);

            reconnectTrait.deactivate();

            jest.advanceTimersByTime(P2PReconnectTrait.RETRY_DELAY);

            expect(startMock).toHaveBeenCalledTimes(0);
        });
        it('if signaling goes down before retry gets to execute', () => {
            reconnectTrait.activate(remoteAddress);

            expect(startMock).toHaveBeenCalledTimes(1);

            p2pClient.emit(P2PSignalingBase.DATA_CHANNEL_READY_UPDATE, remoteAddress, false);

            expect(startMock).toHaveBeenCalledTimes(1);

            xmppConnection.isConnected = () => false;
            xmppConnection.emit(XmppConnection.CONNECTED_STATE_CHANGED, false);

            jest.advanceTimersByTime(P2PReconnectTrait.RETRY_DELAY);

            expect(startMock).toHaveBeenCalledTimes(1);
        });
    });
    describe('does not close already open connection', () => {
        beforeEach(() => {
            p2pClient.getConnectionForAddress = () => {
                return {
                    isDataChannelActive: () => true
                };
            };

            reconnectTrait.activate(remoteAddress);

            expect(startMock).toHaveBeenCalledTimes(0);
        });
        it('when deactivated', () => {
            reconnectTrait.deactivate();

            jest.advanceTimersByTime(P2PReconnectTrait.RETRY_DELAY);

            expect(stopMock).toHaveBeenCalledTimes(0);
        });
        it('when signaling goes down', () => {
            xmppConnection.isConnected = () => false;
            xmppConnection.emit(XmppConnection.CONNECTED_STATE_CHANGED, false);

            jest.advanceTimersByTime(P2PReconnectTrait.RETRY_DELAY);

            expect(stopMock).toHaveBeenCalledTimes(0);
        });
    });
});
