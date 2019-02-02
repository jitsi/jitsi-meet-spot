import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a button to navigate through the different views of the waiting
 * view.
 *
 * @extends React.Component
 */
export default class NavButton extends React.Component {
    static propTypes = {
        active: PropTypes.bool,
        iconName: PropTypes.string,
        label: PropTypes.string,
        onClick: PropTypes.func
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { active, iconName, label, onClick } = this.props;

        return (
            <div
                className = { `nav-button ${active ? 'active' : ''}` }
                onClick = { onClick }>
                <div className = 'nav-icon'>
                    <i className = 'material-icons'>{ iconName }</i>
                </div>
                <div>
                    { label }
                </div>
            </div>
        );
    }
}
