import { showModal } from 'common/app-state';
import { CallEnd } from 'common/icons';
import React from 'react';
import { connect } from 'react-redux';


import { NavButton } from './../../nav';
import HangupModal from './HangupModal';

interface IProps {
    onHangup?: () => void;
}

/**
 * A component for leaving a meeting in progress.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function HangupButton(props: IProps) {
    return (
        <NavButton
            className = 'hangup'
            onClick = { props.onHangup }
            qaId = 'hangup'>
            <CallEnd />
        </NavButton>
    );
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
        onHangup() {
            dispatch(showModal(HangupModal));
        }
    };
}

export default connect(undefined, mapDispatchToProps)(HangupButton);
