import * as types from './action-types';
import setupReducer from './reducer';

describe('setup reducer', () => {
    it('by default has setup as not complete', () => {
        expect(setupReducer(undefined, {}))
            .toEqual(expect.objectContaining({ completed: false }));
    });

    it('sets an avatar url', () => {
        const avatarUrl = 'new-url';

        expect(setupReducer(undefined, {
            type: types.SET_AVATAR_URL,
            avatarUrl
        }))
        .toEqual(expect.objectContaining({ avatarUrl }));
    });

    it('sets a display name', () => {
        const displayName = 'new-name';

        expect(setupReducer(undefined, {
            type: types.SET_DISPLAY_NAME,
            displayName
        }))
        .toEqual(expect.objectContaining({ displayName }));
    });

    it('sets a jwt', () => {
        const jwt = 'test-jwt';

        expect(setupReducer(undefined, {
            type: types.SET_JWT,
            jwt
        }))
        .toEqual(expect.objectContaining({ jwt }));
    });

    it('sets preferred audio/video devices', () => {
        const cameraLabel = 'camera-label';
        const micLabel = 'mic-label';
        const speakerLabel = 'speaker-label';

        expect(setupReducer(undefined, {
            type: types.SET_PREFERRED_DEVICES,
            cameraLabel,
            micLabel,
            speakerLabel
        }))
        .toEqual(expect.objectContaining({
            preferredCamera: cameraLabel,
            preferredMic: micLabel,
            preferredSpeaker: speakerLabel
        }));
    });

    it('sets toggles the visibility of the in-meeting toolbar', () => {
        expect(setupReducer({
            showMeetingToolbar: true
        }, {
            type: types.SET_SHOW_MEETING_TOOLBAR,
            visible: false
        }))
        .toEqual(expect.objectContaining({ showMeetingToolbar: false }));

        expect(setupReducer({
            showMeetingToolbar: false
        }, {
            type: types.SET_SHOW_MEETING_TOOLBAR,
            visible: true
        }))
        .toEqual(expect.objectContaining({ showMeetingToolbar: true }));
    });
});
