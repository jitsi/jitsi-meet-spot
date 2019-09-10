import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a button with a main value in the center and a sub value smaller
 * and below the main value.
 *
 * @extends React.Component
 */
export default class DialButton extends React.Component {
    static propTypes = {
        mainValue: PropTypes.string,
        onClick: PropTypes.func,
        onLongClick: PropTypes.func,
        sub: PropTypes.string
    }

    /**
     * Initializes a new {@code DialButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._submitSecondaryValueTimeout = null;

        this._onClearSecondaryValueSubmitTimeout
            = this._onClearSecondaryValueSubmitTimeout.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
    }

    /**
     * Stops any long press timeout in flight.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._onClearSecondaryValueSubmitTimeout();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <button
                className = 'dial-button'
                onClick = { this._onClearSecondaryValueSubmitTimeout }
                onMouseDown = { this._onTouchStart }
                onTouchEnd = { this._onTouchEnd }
                onTouchStart = { this._onTouchStart }
                tabIndex = { -1 }
                type = 'button'>
                <span className = 'main'>{ this.props.mainValue }</span>
                { typeof this.props.sub === 'undefined'
                    ? null
                    : <span className = 'sub'>{ this.props.sub }</span> }
            </button>
        );
    }

    /**
     * Stops the timeout which will invoke the onLongClick prop callback when
     * the button is long pressed.
     *
     * @private
     * @returns {void}
     */
    _onClearSecondaryValueSubmitTimeout() {
        clearTimeout(this._submitSecondaryValueTimeout);
    }

    /**
     * Stops any long press handling.
     *
     * @param {Object} e - The React SyntheticEvent for when the user stops a
     * touching the window.
     * @private
     * @returns {void}
     */
    _onTouchEnd(e) {
        // Use preventDefault to avoid an extra call to onMouseDown.
        // See https://github.com/facebook/react/issues/9809#issuecomment-507640770
        e.preventDefault();

        this._onClearSecondaryValueSubmitTimeout();
    }

    /**
     * Callback invoked when the user interacts with the button to simulate a
     * click.
     *
     * @param {Object} e - The React SyntheticEvent for when the user has
     * initially touched the button.
     * @private
     * @returns {void}
     */
    _onTouchStart(e) {
        e.stopPropagation();
        e.preventDefault();

        this._setSecondaryValueSubmitTimeout();
        this.props.onClick(this.props.mainValue);
    }

    /**
     * Starts the timeout for checking if the button is being long pressed.
     *
     * @private
     * @returns {void}
     */
    _setSecondaryValueSubmitTimeout() {
        this._onClearSecondaryValueSubmitTimeout();

        this._submitSecondaryValueTimeout = setTimeout(() => {
            if (this.props.onLongClick) {
                this.props.onLongClick(this.props.sub);
            }
        }, 1500);
    }
}
