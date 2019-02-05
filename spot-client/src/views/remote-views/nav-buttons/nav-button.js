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
        onClick: PropTypes.func,
        qaId: PropTypes.string
    };

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { active, iconName, label, onClick, qaId } = this.props;

        return (
            <div
                className = { `nav-button ${active ? 'active' : ''}` }
                data-qa-id = { qaId }
                onClick = { onClick }>

                {

                    /**
                     * But the icon in a container to prevent resizing with
                     * the label.
                     */
                }
                <div className = 'navi-icon-container'>
                    <div className = 'nav-icon'>
                        <i className = 'material-icons'>{ iconName }</i>
                    </div>
                </div>
                <div className = 'nav-label-container'>
                    <div className = 'nav-label'>
                        { label }
                    </div>
                </div>
            </div>
        );
    }
}
