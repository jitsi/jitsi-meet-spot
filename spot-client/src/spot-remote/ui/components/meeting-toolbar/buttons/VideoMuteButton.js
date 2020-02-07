import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    getOptimisticVideoMuteState,
    isVideoMutePending,
    setVideoMute
} from 'common/app-state';
import { VideocamOutlined, VideocamOffOutlined } from 'common/icons';

import { NavButton } from './../../nav';

/**
 * A component for displaying and changing the current video mute of a Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function VideoMuteButton({ changePending, onSetVideoMute, videoMuted }) {
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

VideoMuteButton.propTypes = {
    changePending: PropTypes.bool,
    onSetVideoMute: PropTypes.func,
    videoMuted: PropTypes.bool
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code VideoMuteButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
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
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        onSetVideoMute(mute) {
            dispatch(setVideoMute(mute));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoMuteButton);
