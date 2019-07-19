import * as types from './action-types';
import wiredScreenshareReducer from './reducer';

describe('wiredScreenshare reducer', () => {
    it('has no wried screenshare device by default', () => {
        expect(wiredScreenshareReducer(undefined, {}))
            .toEqual({
                available: false,
                isDeviceConnected: false
            });
    });

    it('sets if the wired screenshare device is currently connected', () => {
        const connectedState = wiredScreenshareReducer(undefined, {
            type: types.WIRED_SCREENSHARE_SET_DEVICE_CONNECTED,
            connected: true
        });

        expect(connectedState).toEqual(expect.objectContaining({
            isDeviceConnected: true
        }));

        const disconnectedState = wiredScreenshareReducer(connectedState, {
            type: types.WIRED_SCREENSHARE_SET_DEVICE_CONNECTED,
            connected: false
        });

        expect(disconnectedState).toEqual(expect.objectContaining({
            isDeviceConnected: false
        }));
    });

    it('sets if an input device is connected to the screenshare device', () => {
        const isAvailableState = wiredScreenshareReducer(undefined, {
            type: types.WIRED_SCREENSHARE_SET_INPUT_AVAILABILITY,
            available: true
        });

        expect(isAvailableState).toEqual(expect.objectContaining({
            available: true
        }));

        const isNotAvailableState = wiredScreenshareReducer(isAvailableState, {
            type: types.WIRED_SCREENSHARE_SET_INPUT_AVAILABILITY,
            available: false
        });

        expect(isNotAvailableState).toEqual(expect.objectContaining({
            available: false
        }));
    });

    it('sets the preferred wired screenshare device', () => {
        const wiredScreenshareDeviceLabel = 'test-label';

        expect(wiredScreenshareReducer(undefined, {
            type: types.WIRED_SCREENSHARE_SET_INPUT_LABEL,
            deviceLabel: wiredScreenshareDeviceLabel
        })).toEqual(expect.objectContaining({
            deviceLabel: wiredScreenshareDeviceLabel
        }));
    });

    it('stores what the wired screenshare device sees when idle', () => {
        const inputIdleFrameValue = 123;

        expect(wiredScreenshareReducer(undefined, {
            type: types.WIRED_SCREENSHARE_SET_INPUT_IDLE_VALUE,
            value: inputIdleFrameValue
        })).toEqual(expect.objectContaining({
            idleValue: inputIdleFrameValue
        }));
    });
});
