import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    hideFeedback,
    isAppFeedbackShown,
    submitFeedback
} from 'common/app-state';

import { FeedbackForm } from './FeedbackForm';

/**
 * A functional component for showing app feedback entry while covering the
 * application.
 *
 * @param {Object} props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function FeedbackOverlay(props) {
    if (!props.displayFeedback) {
        return null;
    }

    return (
        <div className = 'feedback-view status-overlay app-feedback-overlay'>
            <div className = 'feedback-form'>
                <FeedbackForm
                    commentOnly = { true }
                    disableInactivityTimer = { true }
                    onSkip = { props.onCancelFeedback }
                    onSubmitFeedback = { props.onSubmitFeedback } />
            </div>
        </div>
    );
}

FeedbackOverlay.propTypes = {
    displayFeedback: PropTypes.bool,
    onCancelFeedback: PropTypes.func,
    onSubmitFeedback: PropTypes.func
};

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AutoReload}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        displayFeedback: isAppFeedbackShown(state)
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
        onCancelFeedback() {
            dispatch(hideFeedback());
        },

        onSubmitFeedback(feedback) {
            dispatch(submitFeedback(feedback));
            dispatch(hideFeedback());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackOverlay);
