import PropTypes from 'prop-types';
import React from 'react';

import View from './view';

/**
 * A component for displaying a message about a current operation in progress.
 * Used for displaying a message about a recoverable error as recovery is in
 * progress.
 */
export default class ServiceMessage extends React.Component {
    static propTypes = {
        message: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <View name = 'spot-tv-error'>
                <div className = 'container'>
                    <div className = 'admin'>
                        <div>
                            { this.props.message }
                        </div>
                    </div>
                </div>
            </View>
        );
    }
}
