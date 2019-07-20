import spotTvReducer from './reducer';
import * as types from './action-types';

describe('spot-tv reducer', () => {
    const expectedDefaultState = {
        audioMuted: true,
        electron: false,
        inMeeting: undefined,
        kicked: false,
        needPassword: false,
        remoteJoinCode: undefined,
        roomName: undefined,
        screensharing: false,
        screensharingType: undefined,
        spotId: undefined,
        tileView: false,
        videoMuted: true,
        view: undefined
    };

    it('has features not set by default', () => {
        expect(spotTvReducer(undefined, {})).toEqual(expectedDefaultState);
    });

    it('can return to state with not features enabled', () => {
        expect(spotTvReducer({
            inMeeting: 'some-meeting',
            remoteJoinCode: '123',
            screensharingType: 'wired'
        }, {
            type: types.SPOT_TV_CLEAR_STATE
        })).toEqual(expectedDefaultState);
    });

    it('can batch update new state', () => {
        const newState = {
            inMeeting: 'some-meeting',
            needPassword: true,
            remoteJoinCode: '123',
            screensharingType: 'wired',
            tileView: true
        };

        expect(spotTvReducer(expectedDefaultState, {
            type: types.SPOT_TV_SET_STATE,
            newState
        })).toEqual({
            ...expectedDefaultState,
            ...newState
        });
    });

    it('can update the known join code', () => {
        const remoteJoinCode = '123';

        expect(spotTvReducer({}, {
            type: types.SPOT_TV_SET_REMOTE_JOIN_CODE,
            remoteJoinCode
        })).toEqual(expect.objectContaining({ remoteJoinCode }));
    });
});
