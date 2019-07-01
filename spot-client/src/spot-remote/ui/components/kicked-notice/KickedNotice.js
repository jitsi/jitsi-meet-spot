import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'common/ui';

/**
 * Informs that the Spot-TV has been removed from the conference.
 *
 * @extends React.Component
 */
export default class KickedNotice extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'kicked-notice'>
                <div className = 'cta'>You have been removed from the conference</div>
                <Button onClick = { this.props.onSubmit }>Continue</Button>
            </div>
        );
    }
}
