import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a child element as a trigger to a popover with a toggle-able
 * visibility.
 *
 * @extends React.Component
 */
export default class Popover extends React.Component {
    static propTypes = {
        children: PropTypes.any,
        onOutsideClick: PropTypes.func,
        popoverContent: PropTypes.object,
        showPopover: PropTypes.bool
    };

    /**
     * Initializes a new {@code Popover} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._ref = React.createRef();

        this._onOutsideClick = this._onOutsideClick.bind(this);
    }

    /**
     * Adds a global event listener to automatically close the screenshare
     * picker.
     *
     * @inheritdoc
     */
    componentDidMount() {
        document.addEventListener(
            'mousedown', this._onOutsideClick);
    }

    /**
     * Removes global event listeners.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        document.removeEventListener(
            'mousedown', this._onOutsideClick);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { popoverContent, showPopover } = this.props;

        const className = `with-popup ${showPopover ? '' : 'hide-popup'}`;

        return (
            <div
                className = { className }
                ref = { this._ref }>
                { this.props.children }
                <div className = 'popup'>
                    { popoverContent }
                </div>
            </div>
        );
    }

    /**
     * Detects when a click occurs outside of the elements of the popover and
     * trigger and invokes a callback.
     *
     * @private
     * @returns {void}
     */
    _onOutsideClick() {
        if (this.props.onOutsideClick
            && !this._ref.current.contains(event.target)) {
            this.props.onOutsideClick();
        }
    }
}
