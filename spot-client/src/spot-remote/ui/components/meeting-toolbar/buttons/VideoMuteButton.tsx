import {
    getInMeetingStatus,
    getOptimisticVideoMuteState,
    isVideoMutePending,
    setVideoMute
} from 'common/app-state';
import { VideocamOffOutlined, VideocamOutlined } from 'common/icons';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../../nav';

interface IProps {
    changePending?: boolean;
    onSetVideoMute: (mute: boolean) => void;
    videoMuted?: boolean;
}

/**
 * A component for displaying and changing the current video mute of a Spot-TV.
 *
 * @param props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function VideoMuteButton({ changePending, onSetVideoMute, videoMuted }: IProps) {
    const onClick = useCallback(() => {
        if (changePending) {
            return;
        }

        onSetVideoMute(!videoMuted);
    }, [ changePending, onSetVideoMute, videoMuted ]);

    return (
        <NavButton
            active = { changePending ? videoMuted : !videoMuted }
            className = { `video-mute-button ${changePending ? 'pending' : ''}` }
            onClick = { onClick }
            qaId = { videoMuted ? 'unmute-video' : 'mute-video' }>
            { videoMuted ? <VideocamOffOutlined /> : <VideocamOutlined /> }
        </NavButton>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code VideoMuteButton}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: any) {
    const optimisticMuteState = getOptimisticVideoMuteState(state);

    return {
        videoMuted: typeof optimisticMuteState === 'undefined'
            ? getInMeetingStatus(state).videoMuted : optimisticMuteState,
        changePending: isVideoMutePending(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        onSetVideoMute(mute: boolean) {
            dispatch(setVideoMute(mute));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoMuteButton);
