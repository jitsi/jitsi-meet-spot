import { render, fireEvent } from '@testing-library/react';
import { mockT } from 'common/test-mocks';
import React from 'react';


import { AudioMuteButton as AudioMuteButtonImpl } from './AudioMuteButton';

const AudioMuteButton: any = AudioMuteButtonImpl;

describe('AudioMuteButton', () => {
    let setAudioMuteCallback: jest.Mock;

    let container: HTMLElement;
    let rerender: (ui: React.ReactElement) => void;

    beforeEach(() => {
        setAudioMuteCallback = jest.fn();

        ({ container, rerender } = render(
            <AudioMuteButton
                audioMuted = { false }
                onSetAudioMute = { setAudioMuteCallback }
                t = { mockT } />
        ));
    });

    describe('when not muted', () => {
        it('displays UI showing no mute', () => {
            expect(container.querySelectorAll('[data-testid="MicNoneOutlinedIcon"]')).toHaveLength(1);
            expect(container.querySelectorAll('[data-testid="MicOffOutlinedIcon"]')).toHaveLength(0);
        });

        it('notifies of mute action', () => {
            fireEvent.click(container.querySelector('button')!);

            expect(setAudioMuteCallback).toHaveBeenCalledWith(true);
        });

        it('displays pending state when unmute is still processing', () => {
            rerender(
                <AudioMuteButton
                    audioMuted = { false }
                    changePending = { true }
                    onSetAudioMute = { setAudioMuteCallback }
                    t = { mockT } />
            );

            expect(container.querySelectorAll('[data-testid="MicNoneOutlinedIcon"]')).toHaveLength(1);
            expect(container.querySelectorAll('[data-testid="MicOffOutlinedIcon"]')).toHaveLength(0);
        });
    });

    describe('when muted', () => {
        beforeEach(() => {
            rerender(
                <AudioMuteButton
                    audioMuted = { true }
                    onSetAudioMute = { setAudioMuteCallback }
                    t = { mockT } />
            );
        });

        it('displays UI showing mute', () => {
            expect(container.querySelectorAll('[data-testid="MicNoneOutlinedIcon"]')).toHaveLength(0);
            expect(container.querySelectorAll('[data-testid="MicOffOutlinedIcon"]')).toHaveLength(1);
        });

        it('notifies of unmute action', () => {
            fireEvent.click(container.querySelector('button')!);

            expect(setAudioMuteCallback).toHaveBeenCalledWith(false);
        });

        it('displays pending state when mute is still processing', () => {
            rerender(
                <AudioMuteButton
                    audioMuted = { true }
                    changePending = { true }
                    onSetAudioMute = { setAudioMuteCallback }
                    t = { mockT } />
            );

            expect(container.querySelectorAll('[data-testid="MicNoneOutlinedIcon"]')).toHaveLength(0);
            expect(container.querySelectorAll('[data-testid="MicOffOutlinedIcon"]')).toHaveLength(1);
        });
    });
});
