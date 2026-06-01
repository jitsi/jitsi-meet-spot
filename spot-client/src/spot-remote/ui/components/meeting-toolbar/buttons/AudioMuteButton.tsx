import type { RootState } from 'common/app-state';
import {
    getInMeetingStatus,
    getOptimisticAudioMuteState,
    isAudioMutePending,
    setAudioMute
} from 'common/app-state';
import { MicNoneOutlined, MicOffOutlined } from 'common/icons';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../../nav';

interface IProps {
    audioMuted?: boolean;
    changePending?: boolean;
    onSetAudioMute?: (mute: boolean) => void;
}

/**
 * A component for displaying and changing the current audio mute of a Spot-TV.
 *
 * @param props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function AudioMuteButton({ audioMuted, changePending, onSetAudioMute }: IProps) {
    const onClick = useCallback(() => {
        if (changePending) {
            return;
        }

        onSetAudioMute?.(!audioMuted);
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

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AudioMuteButton}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
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
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        onSetAudioMute(mute: boolean) {
            dispatch(setAudioMute(mute));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AudioMuteButton);
