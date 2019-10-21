import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { Backspace, Call } from 'common/icons';
import { LoadingIcon } from 'common/ui';

import CountryCodeButton from './CountryCodeButton';
import CountryCodePicker from './CountryCodePicker';
import DialButton from './dial-button';
import NumberInput from './NumberInput';

/**
 * Displays numbers and an input for entering a phone number.
 *
 * @extends React.Component
 */
export class StatelessDialPad extends React.Component {
    static defaultProps = {
        readOnlyInput: false,
        selectedCountryCode: 'US',
        value: ''
    };

    static propTypes = {
        dialingInProgress: PropTypes.bool,
        disableCallButton: PropTypes.bool,
        disablePlusSign: PropTypes.bool,
        onChange: PropTypes.func,
        onCountryCodeSelect: PropTypes.func,
        onSubmit: PropTypes.func,
        onToggleCountryCodePicker: PropTypes.func,
        placeholderText: PropTypes.string,
        readOnlyInput: PropTypes.bool,
        selectedCountryCode: PropTypes.string,
        showCountryCodePicker: PropTypes.bool,
        t: PropTypes.func,
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

        this._countryCodePickerWrapperRef = React.createRef();
        this._countryCodePickerTriggerRef = React.createRef();

        this._onDeleteLastCharacter = this._onDeleteLastCharacter.bind(this);
        this._onDialButtonClick = this._onDialButtonClick.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onInputChange = this._onInputChange.bind(this);
        this._onMaybeCloseCountryPicker = this._onMaybeCloseCountryPicker.bind(this);
        this._onReplaceLastChar = this._onReplaceLastChar.bind(this);
        this._renderDialButton = this._renderDialButton.bind(this);
    }

    /**
     * Adds listeners for closing {@code CountryCodePicker}.
     *
     * @inheritdoc
     */
    componentDidMount() {
        document.addEventListener('click', this._onMaybeCloseCountryPicker);
        document.addEventListener('touchend', this._onMaybeCloseCountryPicker);

    }

    /**
     * Removes listeners for closing {@code CountryCodePicker}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        document.removeEventListener('click', this._onMaybeCloseCountryPicker);
        document.removeEventListener('touchend', this._onMaybeCloseCountryPicker);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            dialingInProgress,
            disableCallButton,
            onCountryCodeSelect,
            placeholderText,
            readOnlyInput,
            showCountryCodePicker,
            t,
            value
        } = this.props;
        const callButtonDisabled = disableCallButton || dialingInProgress;

        let callButtonClassName = 'call-button dial-button';

        if (callButtonDisabled) {
            callButtonClassName += ' disabled';
        }

        return (
            <form
                className = 'dial-pad'
                onSubmit = { this._onSubmit }>
                <div className = 'dial-pad-entered-number'>
                    { this._renderCountrySelector() }
                    <NumberInput
                        className = 'number-input'
                        gradientStart = 'center'
                        onChange = { this._onInputChange }
                        placeholder = { placeholderText
                            || t('dial.enterPhoneNumber') }
                        readOnly = { readOnlyInput }
                        type = 'tel'
                        value = { value } />
                </div>
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
                        { this._renderDialButton('＊') }
                        { this._renderZeroButton() }
                        { this._renderDialButton('#') }
                    </div>
                    <div className = 'dial-pad-footer'>
                        <div className = 'dial-pad-footer-button' />
                        <div className = 'dial-pad-footer-button'>
                            <button
                                className = { callButtonClassName }
                                disabled = { callButtonDisabled }
                                onClick = { this._onSubmit }
                                type = 'submit'>
                                { dialingInProgress
                                    ? <LoadingIcon />
                                    : <Call />}
                            </button>
                        </div>
                        <div className = 'dial-pad-footer-button'>
                            {
                                this.props.value
                                    && <button
                                        className = 'backspace'
                                        onClick = { this._onDeleteLastCharacter }
                                        tabIndex = { -1 }
                                        type = 'button'>
                                        <Backspace />
                                    </button>
                            }
                        </div>
                    </div>
                    {
                        showCountryCodePicker && (
                            <div
                                className = 'country-code-picker-wrapper'
                                ref = { this._countryCodePickerWrapperRef }>
                                <CountryCodePicker onCountryCodeSelect = { onCountryCodeSelect } />
                            </div>
                        )
                    }
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
        // The ＊ sign was used as the buttons value to make it look better. But it needs to be translated back to * in
        // order for the DTMF tones to work correctly.
        const filteredValue = value === '＊' ? '*' : value;

        this.props.onChange(`${this.props.value}${filteredValue}`);
    }

    /**
     * Toggles {@code CountryPicker} closed if there is an interaction outside
     * of the {@code CountryPicker}. Trigger button clicks are also ignored
     * because the trigger button itself will handle toggling the picker.
     *
     * @param {Object} e - The SyntheticEvent for interacting with the document.
     * @private
     * @returns {void}
     */
    _onMaybeCloseCountryPicker(e) {
        if (this.props.showCountryCodePicker
            && !this._countryCodePickerWrapperRef.current.contains(e.target)
            && !this._countryCodePickerTriggerRef.current.containsElement(e.target)) {
            this.props.onToggleCountryCodePicker();
        }
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
     * Renders a toggle for the country code search while displaying the
     * currently selected country.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderCountrySelector() {
        return (
            <CountryCodeButton
                code = { this.props.selectedCountryCode }
                onClick = { this.props.onToggleCountryCodePicker }
                ref = { this._countryCodePickerTriggerRef } />
        );
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
                onLongClick = { this.props.disablePlusSign ? undefined : this._onReplaceLastChar }
                sub = { this.props.disablePlusSign ? '' : '+' } />
        );
    }
}

export default withTranslation()(StatelessDialPad);
