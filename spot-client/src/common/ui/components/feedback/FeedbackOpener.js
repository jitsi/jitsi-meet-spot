import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Feedback } from 'common/icons';
import { getCurrentView, showFeedback } from 'common/app-state';

/**
 * Functional component for showing a button that opens the feedback overlay.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function FeedbackOpener(props) {
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

FeedbackOpener.propTypes = {
    onClick: PropTypes.func,
    show: PropTypes.bool
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code FeedbackOpener}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        show: getCurrentView(state) !== 'feedback'
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
        onClick() {
            dispatch(showFeedback());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackOpener);
