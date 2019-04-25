import PropTypes from 'prop-types';
import React from 'react';

/**
 * A React Component for entering a character into an input field as part of
 * a larger code entry component.
 *
 * @extends React.Component
 */
export default class InputBox extends React.Component {
    static propTypes = {
        autoFocus: PropTypes.bool,
        index: PropTypes.number,
        onBlur: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onKeyDown: PropTypes.func,
        value: PropTypes.string
    };

    /**
     * Initializes a new {@code InputBox} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._ref = React.createRef();

        this._onChange = this._onChange.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    /**
     * Cleans up any timeout to select the input value.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearTimeout(this._valueSelectTimeout);
    }

    /**
     * Programmatically unset focus on the HTML Input element.
     *
     * @returns {void}
     */
    blur() {
        this._ref.current.blur();
    }

    /**
     * Programmatically set focus on the HTML Input element.
     *
     * @returns {void}
     */
    focus() {
        this._ref.current.focus();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <input
                autoComplete = 'off'
                autoFocus = { this.props.autoFocus }
                className = 'box'
                onChange = { this._onChange }
                onFocus = { this._onFocus }
                onInput = { this._onInput }
                onKeyDown = { this._onKeyDown }
                ref = { this._ref }
                type = 'text'
                value = { this.props.value } />
        );
    }

    /**
     * Callback invoked when the entered value of the input has been updated.
     *
     * @param {Object} event - The browser change event.
     * @private
     * @returns {void}
     */
    _onChange(event) {
        this.props.onChange(
            this.props.index,
            String(event.target.value)
        );
    }

    /**
     * Callback invoked when the input has received focus. Attempt to
     * automatically select any entered value.
     *
     * @private
     * @returns {void}
     */
    _onFocus() {
        clearTimeout(this._valueSelectTimeout);

        if (this.props.value.length) {
            // Use a setTimeout as a workaround for mobile Safari suffering from
            // improper input centering when select is being called immediately
            // after a focus.
            this._valueSelectTimeout = setTimeout(() => {
                this._select();
            }, 0);
        }
    }

    /**
     * Callback invoked when a value has been entered. This callback exists
     * to detect when the same value has been re-entered, which would not
     * trigger a change event.
     *
     * @param {Object} event - The browser input event.
     * @private
     * @returns {void}
     */
    _onInput(event) {
        if (event.target.value === this.props.value) {
            this.props.onChange(
                this.props.index,
                String(event.target.value)
            );
        }
    }

    /**
     * Callback invoked when a key has been pressed in the input.
     *
     * @param {Object} event - The keydown event.
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        this.props.onKeyDown(this.props.index, event);
    }

    /**
     * Selects the current entered value.
     *
     * @private
     * @returns {void}
     */
    _select() {
        // Use selectionStart and selectionEnd over Input#select for mobile
        // Safari support.
        this._ref.current.selectionStart = 0;
        this._ref.current.selectionEnd = this.props.value.length;
    }
}
