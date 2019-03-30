import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';

/**
 * Displays a button to navigate through the different views of the waiting
 * view.
 *
 * @extends React.Component
 */
export default class NavButton extends React.Component {
    static defaultProps = {
        className: '',
        type: 'button'
    };

    static propTypes = {
        active: PropTypes.bool,
        className: PropTypes.string,
        disabled: PropTypes.bool,
        iconName: PropTypes.string,
        label: PropTypes.string,
        onClick: PropTypes.func,
        qaId: PropTypes.string,
        subIcon: PropTypes.node,
        type: PropTypes.string
    };

    /**
     * Initializes a new {@code NavButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onClick = this._onClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            active,
            className,
            disabled,
            iconName,
            label,
            qaId,
            subIcon,
            type
        } = this.props;

        let rootClassName = 'nav-button';

        if (disabled) {
            rootClassName += ' disabled';
        }

        if (active) {
            rootClassName += ' active';
        }

        if (className) {
            rootClassName += ' rootClassName';
        }

        return (
            <button
                className = { rootClassName }
                data-qa-id = { qaId }
                disabled = { disabled }
                onClick = { this._onClick }
                tabIndex = { 0 }
                type = { type }>
                {

                    /**
                     * But the icon in a container to prevent resizing with
                     * the label.
                     */
                }
                <div className = 'nav-icon-container'>
                    <div className = 'nav-icon'>
                        <i className = 'material-icons'>{ iconName }</i>
                        { subIcon && (
                            <div className = 'sub-icon'>
                                { subIcon }
                            </div>)
                        }
                    </div>
                </div>
                <div className = 'nav-label-container'>
                    <div className = 'nav-label'>
                        { label }
                    </div>
                </div>
            </button>
        );
    }

    /**
     * Callback invokvd when the component is clicked.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        logger.log('Nav button clicked', { label: this.props.label });

        if (this.props.onClick) {
            this.props.onClick();
        }
    }
}
