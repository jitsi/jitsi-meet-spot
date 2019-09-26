import { mount } from 'enzyme';
import React from 'react';

import { Mic, MicOff } from 'common/icons';

import { AudioMuteButton } from './AudioMuteButton';

describe('AudioMuteButton', () => {
    let setAudioMuteCallback;

    let audioMuteButton;

    beforeEach(() => {
        setAudioMuteCallback = jest.fn();

        audioMuteButton = mount(
            <AudioMuteButton
                audioMuted = { false }
                setAudioMute = { setAudioMuteCallback } />
        );
    });

    afterEach(() => {
        audioMuteButton.unmount();
    });

    describe('when not muted', () => {
        it('displays UI showing no mute', () => {
            expect(audioMuteButton.find('.nav-label').text()).toEqual('Mute Audio');
            expect(audioMuteButton.find(Mic).length).toBe(1);
            expect(audioMuteButton.find(MicOff).length).toBe(0);
        });

        it('notifies of mute action', () => {
            audioMuteButton.find('button').simulate('click');

            expect(setAudioMuteCallback).toHaveBeenCalledWith(true);
        });

        it('displays pending state when unmute is still processing', () => {
            audioMuteButton.setProps({ changePending: true });

            expect(audioMuteButton.find('.nav-label').text()).toEqual('Unmuting...');
            expect(audioMuteButton.find(Mic).length).toBe(1);
            expect(audioMuteButton.find(MicOff).length).toBe(0);
        });
    });

    describe('when muted', () => {
        beforeEach(() => {
            audioMuteButton.setProps({ audioMuted: true });
        });

        it('displays UI showing mute', () => {
            expect(audioMuteButton.find('.nav-label').text()).toEqual('Unmute Audio');
            expect(audioMuteButton.find(Mic).length).toBe(0);
            expect(audioMuteButton.find(MicOff).length).toBe(1);
        });

        it('notifies of unmute action', () => {
            audioMuteButton.find('button').simulate('click');

            expect(setAudioMuteCallback).toHaveBeenCalledWith(false);
        });

        it('displays pending state when mute is still processing', () => {
            audioMuteButton.setProps({ changePending: true });

            expect(audioMuteButton.find('.nav-label').text()).toEqual('Muting...');
            expect(audioMuteButton.find(Mic).length).toBe(0);
            expect(audioMuteButton.find(MicOff).length).toBe(1);
        });
    });
});
