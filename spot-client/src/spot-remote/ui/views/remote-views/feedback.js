import React from 'react';

import { Clock } from 'common/ui';

import { FeedbackForm } from './../../components';

/**
 * A view for the remote that displays a feedback form for a meeting that has
 * been exited.
 *
 * @extends React.PureComponent
 */
export default class FeedbackView extends React.PureComponent {
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'feedback-view'>
                <Clock />
                <div className = 'feedback-form'>
                    <FeedbackForm />
                </div>
            </div>
        );
    }
}
