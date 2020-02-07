import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    getOptimisticAudioMuteState,
    isAudioMutePending,
    setAudioMute
} from 'common/app-state';
import { MicNoneOutlined, MicOffOutlined } from 'common/icons';

import { NavButton } from './../../nav';

/**
 * A component for displaying and changing the current audio mute of a Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function AudioMuteButton({ audioMuted, changePending, onSetAudioMute }) {
    const onClick = useCallback(() => {
        if (changePending) {
            return;
        }

        onSetAudioMute(!audioMuted);
    }, [ audioMuted, changePending, onSetAudioMute ]);

    return (
        <NavButton
            active = { changePending ? audioMuted : !audioMuted }
            className = { changePending ? 'pending' : '' }
            onClick = { onClick }
            qaId = { audioMuted ? 'unmute-audio' : 'mute-audio' }>
            { audioMuted ? <MicOffOutlined /> : <MicNoneOutlined /> }
        </NavButton>
    );
}

AudioMuteButton.propTypes = {
    audioMuted: PropTypes.bool,
    changePending: PropTypes.bool,
    onSetAudioMute: PropTypes.func
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AudioMuteButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const optimisticMuteState = getOptimisticAudioMuteState(state);

    return {
        audioMuted: typeof optimisticMuteState === 'undefined'
            ? getInMeetingStatus(state).audioMuted : optimisticMuteState,
        changePending: isAudioMutePending(state)
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
        onSetAudioMute(mute) {
            dispatch(setAudioMute(mute));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AudioMuteButton);
