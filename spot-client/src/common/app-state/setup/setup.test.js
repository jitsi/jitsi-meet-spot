import { combineReducers, createStore } from 'redux';

import * as actions from './actions';
import setupReducer from './reducer';
import * as selectors from './selectors';

describe('setup state', () => {
    let dispatch, getState;

    beforeEach(() => {
        ({ dispatch, getState } = createStore(combineReducers({ setup: setupReducer })));
    });

    it('by default has setup as not complete', () => {
        expect(selectors.isSetupComplete(getState())).toBe(false);
    });

    it('saves setup completion flag', () => {
        dispatch(actions.setSetupCompleted(true));
        expect(selectors.isSetupComplete(getState())).toBe(true);
    });

    it('saves the avatar url', () => {
        const avatarUrl = 'new-url';

        dispatch(actions.setAvatarUrl(avatarUrl));
        expect(selectors.getAvatarUrl(getState())).toBe(avatarUrl);
    });

    it('saves the display name', () => {
        const displayName = 'new-name';

        dispatch(actions.setDisplayName(displayName));
        expect(selectors.getDisplayName(getState())).toBe(displayName);
    });

    it('save the jwt', () => {
        const jwt = 'test-jwt';

        dispatch(actions.setJwt(jwt));
        expect(selectors.getJwt(getState())).toBe(jwt);
    });

    it('saves preferred audio/video devices', () => {
        const cameraLabel = 'camera-label';
        const micLabel = 'mic-label';
        const speakerLabel = 'speaker-label';

        dispatch(actions.setPreferredDevices(
            cameraLabel,
            micLabel,
            speakerLabel
        ));

        const state = getState();

        expect(selectors.getPreferredCamera(state)).toEqual(cameraLabel);
        expect(selectors.getPreferredMic(state)).toEqual(micLabel);
        expect(selectors.getPreferredSpeaker(state)).toEqual(speakerLabel);
    });

    it('saves the preference for in-meeting toolbar visibility', () => {
        dispatch(actions.setMeetingToolbarVisible(true));
        expect(selectors.getMeetingOptions(getState())).toEqual({
            showMeetingToolbar: true
        });

        dispatch(actions.setMeetingToolbarVisible(false));
        expect(selectors.getMeetingOptions(getState())).toEqual({
            showMeetingToolbar: false
        });
    });
});
