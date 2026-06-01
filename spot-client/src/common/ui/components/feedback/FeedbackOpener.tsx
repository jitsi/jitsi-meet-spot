import type { RootState } from 'common/app-state';
import { getCurrentView, showFeedback } from 'common/app-state';
import { Feedback } from 'common/icons';
import React from 'react';
import { connect } from 'react-redux';

interface IProps {

    /**
     * Callback invoked when the feedback button is clicked.
     */
    onClick?: (...args: any[]) => void;

    /**
     * Whether or not to show the feedback button.
     */
    show?: boolean;
}

/**
 * Functional component for showing a button that opens the feedback overlay.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function FeedbackOpener(props: IProps) {
    if (!props.show) {
        return null;
    }

    return (
        <div className = 'feedback-opener'>
            <Feedback
                className = 'feedback-opener-button'
                onClick = { props.onClick } />
        </div>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code FeedbackOpener}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        show: getCurrentView(state) !== 'feedback'
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
        onClick() {
            dispatch(showFeedback());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackOpener);
