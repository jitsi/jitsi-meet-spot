import PropTypes from 'prop-types';
import React from 'react';

/**
 * Implements a component that renders an admin modal entry.
 */
export default class AdminEntry extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        entryLabel: PropTypes.string
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'admin-entry'>
                <div className = 'admin-entry-title'>
                    { this.props.entryLabel }
                </div>
                <div className = 'admin-entry-content'>
                    { this.props.children }
                </div>
            </div>
        );
    }
}
