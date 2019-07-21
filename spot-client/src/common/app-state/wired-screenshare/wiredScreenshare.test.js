import { combineReducers, createStore } from 'redux';

import * as actions from './actions';
import wiredScreenshareReducer from './reducer';
import * as selectors from './selectors';

describe('wiredScreenshare state', () => {
    let dispatch, getState;

    beforeEach(() => {
        ({
            dispatch,
            getState
        } = createStore(combineReducers({ wiredScreenshare: wiredScreenshareReducer })));
    });

    it('has no wried screenshare device by default', () => {
        const state = getState();

        expect(selectors.getWiredScreenshareInputLabel(state)).toBeFalsy();
        expect(selectors.getWiredScreenshareInputIdleValue(state)).toBeFalsy();
        expect(selectors.isDeviceConnectedForWiredScreensharing(state)).toBeFalsy();
        expect(selectors.isWiredScreenshareInputAvailable(state)).toBeFalsy();
    });

    it('saves if the wired screenshare device is currently connected', () => {
        dispatch(actions.setWiredScreenshareDeviceConnected(true));
        expect(selectors.isDeviceConnectedForWiredScreensharing(getState())).toBe(true);

        dispatch(actions.setWiredScreenshareDeviceConnected(false));
        expect(selectors.isDeviceConnectedForWiredScreensharing(getState())).toBe(false);
    });

    it('saves if an input device is connected to the screenshare device', () => {
        dispatch(actions.setWiredScreenshareInputAvailable(true));
        expect(selectors.isWiredScreenshareInputAvailable(getState())).toBe(true);

        dispatch(actions.setWiredScreenshareInputAvailable(false));
        expect(selectors.isWiredScreenshareInputAvailable(getState())).toBe(false);
    });

    it('saves the preferred wired screenshare device', () => {
        const wiredScreenshareDeviceLabel = 'test-label';

        dispatch(actions.setWiredScreenshareInputLabel(wiredScreenshareDeviceLabel));
        expect(selectors.getWiredScreenshareInputLabel(getState()))
            .toEqual(wiredScreenshareDeviceLabel);
    });

    it('saves what the wired screenshare device sees when idle', () => {
        const idleValue = 123;

        dispatch(actions.setWiredScreenshareInputIdleValue(idleValue));
        expect(selectors.getWiredScreenshareInputIdleValue(getState())).toEqual(idleValue);
    });
});
