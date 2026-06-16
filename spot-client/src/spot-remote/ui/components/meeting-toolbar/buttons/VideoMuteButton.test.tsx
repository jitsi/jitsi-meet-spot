import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';


import { VideoMuteButton } from './VideoMuteButton';

describe('VideoMuteButton', () => {
    let setVideoMuteCallback: jest.Mock;

    let container: HTMLElement;
    let rerender: (ui: React.ReactElement) => void;

    beforeEach(() => {
        setVideoMuteCallback = jest.fn();

        ({ container, rerender } = render(
            <VideoMuteButton
                onSetVideoMute = { setVideoMuteCallback }
                videoMuted = { false } />
        ));
    });

    describe('when not muted', () => {
        it('displays UI showing no mute', () => {
            expect(container.querySelectorAll('[data-testid="VideocamOutlinedIcon"]')).toHaveLength(1);
            expect(container.querySelectorAll('[data-testid="VideocamOffOutlinedIcon"]')).toHaveLength(0);
        });

        it('notifies of mute action', () => {
            fireEvent.click(screen.getByRole('button'));

            expect(setVideoMuteCallback).toHaveBeenCalledWith(true);
        });

        it('displays pending state when unmute is still processing', () => {
            rerender(
                <VideoMuteButton
                    changePending = { true }
                    onSetVideoMute = { setVideoMuteCallback }
                    videoMuted = { false } />
            );

            expect(container.querySelectorAll('[data-testid="VideocamOutlinedIcon"]')).toHaveLength(1);
            expect(container.querySelectorAll('[data-testid="VideocamOffOutlinedIcon"]')).toHaveLength(0);
        });
    });

    describe('when muted', () => {
        beforeEach(() => {
            rerender(
                <VideoMuteButton
                    onSetVideoMute = { setVideoMuteCallback }
                    videoMuted = { true } />
            );
        });

        it('displays UI showing mute', () => {
            expect(container.querySelectorAll('[data-testid="VideocamOutlinedIcon"]')).toHaveLength(0);
            expect(container.querySelectorAll('[data-testid="VideocamOffOutlinedIcon"]')).toHaveLength(1);
        });

        it('notifies of unmute action', () => {
            fireEvent.click(screen.getByRole('button'));

            expect(setVideoMuteCallback).toHaveBeenCalledWith(false);
        });

        it('displays pending state when mute is still processing', () => {
            rerender(
                <VideoMuteButton
                    changePending = { true }
                    onSetVideoMute = { setVideoMuteCallback }
                    videoMuted = { true } />
            );

            expect(container.querySelectorAll('[data-testid="VideocamOutlinedIcon"]')).toHaveLength(0);
            expect(container.querySelectorAll('[data-testid="VideocamOffOutlinedIcon"]')).toHaveLength(1);
        });
    });
});
