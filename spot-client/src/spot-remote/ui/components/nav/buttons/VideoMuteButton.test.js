import { mount } from 'enzyme';
import React from 'react';

import { Videocam, VideocamOff } from 'common/icons';

import { VideoMuteButton } from './VideoMuteButton';

describe('VideoMuteButton', () => {
    let setVideoMuteCallback;
    let videoMuteButton;

    beforeEach(() => {
        setVideoMuteCallback = jest.fn();

        videoMuteButton = mount(
            <VideoMuteButton
                setVideoMute = { setVideoMuteCallback }
                videoMuted = { false } />
        );
    });

    afterEach(() => {
        videoMuteButton.unmount();
    });

    describe('when not muted', () => {
        it('displays UI showing no mute', () => {
            expect(videoMuteButton.find('.nav-label').text()).toEqual('Mute Video');
            expect(videoMuteButton.find(Videocam).length).toBe(1);
            expect(videoMuteButton.find(VideocamOff).length).toBe(0);
        });

        it('notifies of mute action', () => {
            videoMuteButton.find('button').simulate('click');

            expect(setVideoMuteCallback).toHaveBeenCalledWith(true);
        });

        it('displays pending state when unmute is still processing', () => {
            videoMuteButton.setProps({ changePending: true });

            expect(videoMuteButton.find('.nav-label').text()).toEqual('Unmuting...');
            expect(videoMuteButton.find(Videocam).length).toBe(1);
            expect(videoMuteButton.find(VideocamOff).length).toBe(0);
        });
    });

    describe('when muted', () => {
        beforeEach(() => {
            videoMuteButton.setProps({ videoMuted: true });
        });

        it('displays UI showing mute', () => {
            expect(videoMuteButton.find('.nav-label').text()).toEqual('Unmute Video');
            expect(videoMuteButton.find(Videocam).length).toBe(0);
            expect(videoMuteButton.find(VideocamOff).length).toBe(1);
        });

        it('notifies of unmute action', () => {
            videoMuteButton.find('button').simulate('click');

            expect(setVideoMuteCallback).toHaveBeenCalledWith(false);
        });

        it('displays pending state when mute is still processing', () => {
            videoMuteButton.setProps({ changePending: true });

            expect(videoMuteButton.find('.nav-label').text()).toEqual('Muting...');
            expect(videoMuteButton.find(Videocam).length).toBe(0);
            expect(videoMuteButton.find(VideocamOff).length).toBe(1);
        });
    });
});
