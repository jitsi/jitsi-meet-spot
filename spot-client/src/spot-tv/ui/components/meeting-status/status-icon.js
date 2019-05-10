import PropTypes from 'prop-types';
import React from 'react';

/**
 * Wraps an icon for displaying the status of a Spot-TV state.
 *
 * @extends React.Component
 */
export default class StatusIcon extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        qaId: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div
                className = 'status-icon'
                data-qa-id = { this.props.qaId }>
                { this.props.children }
            </div>
        );
    }
}
