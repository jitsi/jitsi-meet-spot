import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';

/**
 * Displays a button with an icon and a label below.
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
        children: PropTypes.node,
        className: PropTypes.string,
        disabled: PropTypes.bool,
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

        this._buttonRef = React.createRef();

        this._onClick = this._onClick.bind(this);
    }

    /**
     * Programmatically set focus on the HTML Button element.
     *
     * @returns {void}
     */
    focus() {
        this._buttonRef.current.focus();
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
            rootClassName += ` ${className}`;
        }

        return (
            <button
                className = { `${rootClassName} ${qaId}` }
                data-qa-id = { qaId }
                disabled = { disabled }
                onClick = { this._onClick }
                ref = { this._buttonRef }
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
                        {
                            this.props.children
                        }
                        { subIcon && (
                            <div className = 'sub-icon'>
                                { subIcon }
                            </div>)
                        }
                    </div>
                </div>
                {
                    label && (
                        <div className = 'nav-label-container'>
                            <div className = 'nav-label'>
                                { label }
                            </div>
                        </div>
                    )
                }
            </button>
        );
    }

    /**
     * Callback invoked when the component is clicked.
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
