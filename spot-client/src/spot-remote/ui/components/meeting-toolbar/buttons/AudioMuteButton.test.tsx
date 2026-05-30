import { MicNoneOutlined, MicOffOutlined } from 'common/icons';
import { mockT } from 'common/test-mocks';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';


import { AudioMuteButton as AudioMuteButtonImpl } from './AudioMuteButton';

const AudioMuteButton: any = AudioMuteButtonImpl;

describe('AudioMuteButton', () => {
    let setAudioMuteCallback: jest.Mock;

    let audioMuteButton: ReactWrapper;

    beforeEach(() => {
        setAudioMuteCallback = jest.fn();

        audioMuteButton = mount(
            <AudioMuteButton
                audioMuted = { false }
                onSetAudioMute = { setAudioMuteCallback }
                t = { mockT } />
        );
    });

    afterEach(() => {
        audioMuteButton.unmount();
    });

    describe('when not muted', () => {
        it('displays UI showing no mute', () => {
            expect(audioMuteButton.find(MicNoneOutlined).length).toBe(1);
            expect(audioMuteButton.find(MicOffOutlined).length).toBe(0);
        });

        it('notifies of mute action', () => {
            audioMuteButton.find('button').simulate('click');

            expect(setAudioMuteCallback).toHaveBeenCalledWith(true);
        });

        it('displays pending state when unmute is still processing', () => {
            audioMuteButton.setProps({ changePending: true });

            expect(audioMuteButton.find(MicNoneOutlined).length).toBe(1);
            expect(audioMuteButton.find(MicOffOutlined).length).toBe(0);
        });
    });

    describe('when muted', () => {
        beforeEach(() => {
            audioMuteButton.setProps({ audioMuted: true });
        });

        it('displays UI showing mute', () => {
            expect(audioMuteButton.find(MicNoneOutlined).length).toBe(0);
            expect(audioMuteButton.find(MicOffOutlined).length).toBe(1);
        });

        it('notifies of unmute action', () => {
            audioMuteButton.find('button').simulate('click');

            expect(setAudioMuteCallback).toHaveBeenCalledWith(false);
        });

        it('displays pending state when mute is still processing', () => {
            audioMuteButton.setProps({ changePending: true });

            expect(audioMuteButton.find(MicNoneOutlined).length).toBe(0);
            expect(audioMuteButton.find(MicOffOutlined).length).toBe(1);
        });
    });
});
