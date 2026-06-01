import type { RootState } from 'common/app-state';
import {
    hideFeedback,
    isAppFeedbackShown,
    submitFeedback
} from 'common/app-state';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { Background } from '../background';

import { FeedbackForm } from './FeedbackForm';

interface IProps {
    displayFeedback?: boolean;
    onCancelFeedback?: (...args: any[]) => void;
    onSubmitFeedback?: (...args: any[]) => void;
    t?: (...args: any[]) => string;
}

/**
 * A functional component for showing app feedback entry while covering the
 * application.
 *
 * @param props - The read-only properties with which the new
 * instance is to be initialized.
 * @returns {ReactElement}
 */
export function FeedbackOverlay(props: IProps) {
    if (!props.displayFeedback) {
        return null;
    }

    return (
        <div className = 'feedback-view status-overlay app-feedback-overlay'>
            <Background />
            <div className = 'feedback-form'>
                <FeedbackForm
                    commentOnly = { true }
                    disableInactivityTimer = { true }
                    onSkip = { props.onCancelFeedback }
                    onSubmitFeedback = { props.onSubmitFeedback }
                    t = { props.t } />
            </div>
        </div>
    );
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code AutoReload}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        displayFeedback: isAppFeedbackShown(state)
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
        onCancelFeedback() {
            dispatch(hideFeedback());
        },

        onSubmitFeedback(feedback: any) {
            dispatch(submitFeedback(feedback));
            dispatch(hideFeedback());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(FeedbackOverlay)
);
