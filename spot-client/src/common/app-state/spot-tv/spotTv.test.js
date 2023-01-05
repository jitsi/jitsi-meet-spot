import { combineReducers, createStore } from 'redux';

import * as actions from './actions';
import spotTvReducer from './reducer';
import * as selectors from './selectors';

describe('spotTv state', () => {
    let dispatch, getState;

    beforeEach(() => {
        ({ dispatch, getState } = createStore(combineReducers({ spotTv: spotTvReducer })));
    });

    describe('meeting state', () => {
        const expectedDefaultMeetingState = {
            audioMuted: true,
            inMeeting: undefined,
            kicked: false,
            needPassword: false,
            screensharingType: undefined,
            tileView: false,
            videoMuted: true,
            waitingForMeetingStart: false,
            wiredScreensharingEnabled: undefined
        };

        it('has features not set by default', () => {
            expect(selectors.getInMeetingStatus(getState()))
                .toEqual(expectedDefaultMeetingState);
        });

        it('stores updated meeting state', () => {
            const newState = {
                inMeeting: 'some-meeting',
                needPassword: true,
                screensharingType: 'wired',
                tileView: true
            };

            dispatch(actions.setSpotTVState(newState));

            expect(selectors.getInMeetingStatus(getState()))
                .toEqual({
                    ...expectedDefaultMeetingState,
                    ...newState
                });
        });

        it('can return to state with no features enabled', () => {
            dispatch(actions.setSpotTVState({
                inMeeting: 'some-meeting',
                needPassword: true,
                screensharingType: 'wired',
                tileView: true
            }));
            dispatch(actions.clearSpotTVState());

            expect(selectors.getInMeetingStatus(getState()))
                .toEqual(expectedDefaultMeetingState);
        });
    });

    it('saves the known join code', () => {
        const remoteJoinCode = '123';

        dispatch(actions.setRemoteJoinCode(remoteJoinCode));

        expect(selectors.getRemoteJoinCode(getState()))
            .toEqual(remoteJoinCode);
    });

    it('saves the current known view on the Spot-TV', () => {
        const newState = { view: 'test-view' };

        dispatch(actions.setSpotTVState(newState));

        expect(selectors.getCurrentView(getState()))
            .toEqual(newState.view);
    });

    it('saves the known Spot-TV name', () => {
        const newState = { roomName: 'test-name' };

        dispatch(actions.setSpotTVState(newState));

        expect(selectors.getRemoteSpotTVRoomName(getState()))
            .toEqual(newState.roomName);
    });

    describe('volume control', () => {
        it('is disabled by default', () => {
            expect(selectors.isVolumeControlSupported(getState())).toBe(false);
        });

        it('is enabled when in electron', () => {
            dispatch(actions.setSpotTVState({
                electron: true,
                volumeControlSupported: false
            }));

            expect(selectors.isVolumeControlSupported(getState())).toBe(true);
        });

        it('is enabled when receives start param', () => {
            dispatch(actions.setSpotTVState({
                electron: false,
                volumeControlSupported: true
            }));

            expect(selectors.isVolumeControlSupported(getState())).toBe(true);
        });
    });

    describe('Spot-TV connection state', () => {
        it('is false when not aware of a Spot-TV', () => {
            expect(selectors.isConnectedToSpot(getState())).toBe(false);
        });

        it('is true when aware of a Spot-TV', () => {
            dispatch(actions.setSpotTVState({
                spotId: '1234'
            }));

            expect(selectors.isConnectedToSpot(getState())).toBe(true);
        });
    });
});
