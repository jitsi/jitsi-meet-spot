import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    getOptimisticVideoMuteState,
    isVideoMutePending,
    setVideoMute
} from 'common/app-state';
import { VideocamOutlined, VideocamOffOutlined } from 'common/icons';

import NavButton from '../nav-button';

/**
 * A component for displaying and changing the current video mute of a Spot-TV.
 *
 * @extends React.Component
 */
export class VideoMuteButton extends React.Component {
    static propTypes = {
        changePending: PropTypes.bool,
        setVideoMute: PropTypes.func,
        t: PropTypes.func,
        videoMuted: PropTypes.bool
    };

    /**
     * Initializes a new {@code VideoMuteButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onToggleVideoMute = this._onToggleVideoMute.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { changePending, videoMuted } = this.props;

        return (
            <NavButton
                active = { changePending ? videoMuted : !videoMuted }
                className = { `video-mute-button ${changePending ? 'pending' : ''}` }
                onClick = { this._onToggleVideoMute }
                qaId = { videoMuted ? 'unmute-video' : 'mute-video' }>
                { videoMuted ? <VideocamOffOutlined /> : <VideocamOutlined /> }
            </NavButton>
        );
    }

    /**
     * Changes the current local video mute state of a Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _onToggleVideoMute() {
        if (this.props.changePending) {
            return;
        }

        this.props.setVideoMute(!this.props.videoMuted);
    }
}

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
        setVideoMute(mute) {
            dispatch(setVideoMute(mute));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoMuteButton);
