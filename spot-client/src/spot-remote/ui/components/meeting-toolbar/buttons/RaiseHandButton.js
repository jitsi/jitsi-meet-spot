import {
    getInMeetingStatus,
    getOptimisticHandRaisedState,
    isRaiseHandPending,
    setRaiseHand
} from 'common/app-state';
import { PanToolOutlined } from 'common/icons';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../../nav';

/**
 * A component for displaying and changing the current hand raise state of a Spot-TV.
 *
 * @param {Object} props - The read-only properties with which the new instance
 * is to be initialized.
 * @returns {ReactElement}
 */
export function RaiseHandButton({ changePending, onSetRaiseHand, handRaised }) {
    const onClick = useCallback(() => {
        if (changePending) {
            return;
        }

        onSetRaiseHand(!handRaised);
    }, [ changePending, onSetRaiseHand, handRaised ]);

    return (
        <NavButton
            active = { changePending ? !handRaised : handRaised }
            className = { `raise-hand-button ${changePending ? 'pending' : ''}` }
            onClick = { onClick }
            qaId = { handRaised ? 'lower-hand' : 'raise-hand' }>
            <PanToolOutlined />
        </NavButton>
    );
}

RaiseHandButton.propTypes = {
    changePending: PropTypes.bool,
    handRaised: PropTypes.bool,
    onSetRaiseHand: PropTypes.func
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code RaiseHandButton}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const optimisticHandRaisedState = getOptimisticHandRaisedState(state);

    return {
        handRaised: typeof optimisticHandRaisedState === 'undefined'
            ? getInMeetingStatus(state).handRaised : optimisticHandRaisedState,
        changePending: isRaiseHandPending(state)
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
        onSetRaiseHand(handRaised) {
            dispatch(setRaiseHand(handRaised));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RaiseHandButton);
