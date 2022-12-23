import PropTypes from 'prop-types';
import React from 'react';

/**
 * A component intended for hold nav buttons. Useful for re-using styling.
 */
export default class NavContainer extends React.Component {
    static propTypes = {
        children: PropTypes.any
    };

    /**
     * Implements React's {@link SettingsMenu#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'nav-section'>
                <div className = 'nav'>
                    { this.props.children }
                </div>
            </div>
        );
    }
}
