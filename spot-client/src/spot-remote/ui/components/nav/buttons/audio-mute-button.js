import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getInMeetingStatus,
    getOptimisticAudioMuteState,
    isAudioMutePending,
    setAudioMute
} from 'common/app-state';
import { Mic, MicOff } from 'common/icons';

import NavButton from './../nav-button';

/**
 * A component for displaying and changing the current audio mute of a Spot-TV.
 *
 * @extends React.Component
 */
export class AudioMuteButton extends React.Component {
    static propTypes = {
        audioMuted: PropTypes.bool,
        changePending: PropTypes.bool,
        setAudioMute: PropTypes.func
    };

    /**
     * Initializes a new {@code AudioMuteButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onToggleAudioMute = this._onToggleAudioMute.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const { audioMuted, changePending } = this.props;
        let label;
        let qaId;

        if (changePending) {
            label = audioMuted ? 'Muting...' : 'Unmuting...';
            qaId = 'mute-audio-change-pending';
        } else {
            label = audioMuted ? 'Unmute Audio' : 'Mute Audio';
            qaId = audioMuted ? 'unmute-audio' : 'mute-audio';
        }

        return (
            <NavButton
                active = { changePending ? !audioMuted : audioMuted }
                className = { changePending ? 'pending' : '' }
                label = { label }
                onClick = { this._onToggleAudioMute }
                qaId = { qaId }>
                { audioMuted ? <MicOff /> : <Mic /> }
            </NavButton>
        );
    }

    /**
     * Changes the current local audio mute state of a Spot-TV.
     *
     * @private
     * @returns {void}
     */
    _onToggleAudioMute() {
        if (this.props.changePending) {
            return;
        }

        this.props.setAudioMute(!this.props.audioMuted);
    }
}

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
 * @param {Object} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        setAudioMute(mute) {
            dispatch(setAudioMute(mute));
        }
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AudioMuteButton);
