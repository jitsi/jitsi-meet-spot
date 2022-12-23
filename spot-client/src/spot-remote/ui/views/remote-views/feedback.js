import { FeedbackForm, RoomName } from 'common/ui';
import React from 'react';


/**
 * A view for Spot-Remote that displays a feedback form for a meeting that has
 * been exited.
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
                <div className = 'view-header'>
                    <RoomName />
                </div>
                <div className = 'feedback-form'>
                    <FeedbackForm />
                </div>
            </div>
        );
    }
}
