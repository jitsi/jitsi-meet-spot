import { showModal } from 'common/app-state';
import { CallEnd } from 'common/icons';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../../nav';
import HangupModal from './HangupModal';

/**
 * A component for leaving a meeting in progress.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function HangupButton(props) {
    return (
        <NavButton
            className = 'hangup'
            onClick = { props.onHangup }
            qaId = 'hangup'>
            <CallEnd />
        </NavButton>
    );
}

HangupButton.propTypes = {
    onHangup: PropTypes.func
};

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        onHangup() {
            dispatch(showModal(HangupModal));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(HangupButton);
