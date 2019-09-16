import PropTypes from 'prop-types';
import React from 'react';

import { Backspace, Call } from 'common/icons';

import DialButton from './dial-button';
import NumberInput from './NumberInput';

/**
 * Displays numbers and an input for entering a phone number.
 *
 * @extends React.Component
 */
export default class StatelessDialPad extends React.Component {
    static defaultProps = {
        buttonText: 'Call',
        placeholderText: 'Enter a phone number',
        value: ''
    };

    static propTypes = {
        buttonText: PropTypes.string,
        onChange: PropTypes.func,
        onSubmit: PropTypes.func,
        placeholderText: PropTypes.string,
        value: PropTypes.string
    };

    /**
     * Initializes a new {@code StatelessDialPad} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onDeleteLastCharacter = this._onDeleteLastCharacter.bind(this);
        this._onDialButtonClick = this._onDialButtonClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onInputChange = this._onInputChange.bind(this);
        this._onReplaceLastChar = this._onReplaceLastChar.bind(this);
        this._renderDialButton = this._renderDialButton.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <form
                className = 'dial-pad'
                onSubmit = { this._onSubmit }>
                <NumberInput
                    className = 'number-input'
                    gradientStart = 'center'
                    onChange = { this._onInputChange }
                    placeholder = { this.props.placeholderText }
                    type = 'tel'
                    value = { this.props.value } />
                <div className = 'dial-pad-buttons'>
                    <div className = 'row'>
                        { this._renderDialButton('1', '') }
                        { this._renderDialButton('2', 'ABC') }
                        { this._renderDialButton('3', 'DEF') }
                    </div>
                    <div className = 'row'>
                        { this._renderDialButton('4', 'GHI') }
                        { this._renderDialButton('5', 'JKL') }
                        { this._renderDialButton('6', 'MNO') }
                    </div>
                    <div className = 'row'>
                        { this._renderDialButton('7', 'PQRS') }
                        { this._renderDialButton('8', 'TUV') }
                        { this._renderDialButton('9', 'WXYZ') }
                    </div>
                    <div className = 'row'>
                        { this._renderDialButton('*') }
                        { this._renderZeroButton() }
                        { this._renderDialButton('#') }
                    </div>
                </div>
                <div className = 'dial-pad-footer'>
                    <div className = 'dial-pad-footer-button' />
                    <div className = 'dial-pad-footer-button'>
                        <button
                            className = 'call-button dial-button'
                            onClick = { this._onSubmit }
                            type = 'submit'>
                            <Call />
                        </button>
                    </div>
                    <div className = 'dial-pad-footer-button'>
                        <button
                            className = 'backspace'
                            onClick = { this._onDeleteLastCharacter }
                            tabIndex = { -1 }
                            type = 'button'>
                            <Backspace />
                        </button>
                    </div>
                </div>
            </form>
        );
    }

    /**
     * Removes the last character from the entered number.
     *
     * @private
     * @returns {void}
     */
    _onDeleteLastCharacter() {
        this.props.onChange(this.props.value.slice(0, -1));
    }

    /**
     * Callback invoked when a button on the dial pad is clicked.
     *
     * @param {string} value - The value of the button.
     * @private
     * @returns {void}
     */
    _onDialButtonClick(value) {
        this.props.onChange(`${this.props.value}${value}`);
    }

    /**
     * Callback invoked when the form's submit action is executed.
     *
     * @param {Event} event - The form submission event.
     * @private
     * @returns {void}
     */
    _onSubmit(event) {
        event.preventDefault();

        this.props.onSubmit && this.props.onSubmit();
    }

    /**
     * Callback invoked when the value of the entered number has been changed
     * through keyboard input.
     *
     * @param {ChangeEvent} event - The DOM event from the input field being
     * updated.
     * @private
     * @returns {void}
     */
    _onInputChange(event) {
        this.props.onChange(event.target.value);
    }

    /**
     * Callback invoked when the previous entered value should be set with a
     * new value.
     *
     * @param {string} value - The value to set at the end of the current
     * entered value.
     * @private
     * @returns {void}
     */
    _onReplaceLastChar(value) {
        const sub = this.props.value.substring(0, this.props.value.length - 1);

        this.props.onChange(`${sub}${value}`);
    }

    /**
     * Helper to create a button for display in the dial pad.
     *
     * @param {string} main - The value of the button.
     * @param {string} sub - A smaller value to display at the bottom of the
     * button.
     * @private
     * @returns {ReactElement}
     */
    _renderDialButton(main, sub) {
        return (
            <DialButton
                id = { `dial-button-${main}` }
                key = { main }
                mainValue = { main }
                onClick = { this._onDialButtonClick }
                sub = { sub } />
        );
    }

    /**
     * Create the button for 0. It is a special case that supports changing the
     * previous entered value to a "+" via a long press.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderZeroButton() {
        return (
            <DialButton
                className = 'larger-sub'
                id = 'dial-button-0'
                key = '0'
                mainValue = '0'
                onClick = { this._onDialButtonClick }
                onLongClick = { this._onReplaceLastChar }
                sub = '+' />
        );
    }
}
