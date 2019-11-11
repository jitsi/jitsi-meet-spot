import { formatIncompletePhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { addNotification, getSpotServicesConfig } from 'common/app-state';
import { phoneAuthorize } from 'common/backend';
import { logger } from 'common/logger';
import { getRandomMeetingName } from 'common/utils';

import {
    getCountryCode,
    getMostRecentCountryCode,
    setMostRecentCountryCode
} from '../../../app-state';

import { findCountryCodeForLanguage } from './LanguageToCountryCode';
import StatelessDialPad from './StatelessDialPad';

/**
 * @typedef {Object} ParsedPhoneNumber
 * @property {string} country - The country code of the parsed phone number.
 * @property {?string} number - The final phone number in E.164 format. The value is defined only if the entered text
 * makes for a valid phone number.
 * @property {?string} formatted - Pretty formatted phone number text if the parsing library provides any for
 * the current input.
 */
/**
 * Tries to parse a phone number out of the given input string(even if not complete yet).
 *
 * @param {string} typedValue - The text to be parsed as a phone number.
 * @param {string} defaultCountryCode - The default country code to be used in case it is not possible to detect from
 * the entered phone number. Some countries may have region specific way for dialing international numbers and that
 * is based on the default country.
 * @returns {ParsedPhoneNumber|undefined}
 */
function parsePhoneNumber(typedValue, defaultCountryCode) {
    const phoneNumber = parsePhoneNumberFromString(typedValue, defaultCountryCode);

    if (!phoneNumber) {
        return undefined;
    }

    const result = {
        country: phoneNumber.country,
        number: phoneNumber.isPossible() ? phoneNumber.number : undefined
    };

    // The order in which formats are pushed is important, because of the select strategy. The first value that will
    // match the input text after stripped down of formatting characters will be used in the UI for the presentation.
    const formatted = [];
    const incompleteFormat = formatIncompletePhoneNumber(typedValue);

    // Special case for incomplete formatting. Most of the time it is equal to the input, so include it in proposals
    // only if adds any actual formatting.
    if (removeFormatting(incompleteFormat) !== incompleteFormat) {
        formatted.push(incompleteFormat);
    }

    formatted.push(phoneNumber.formatNational());
    formatted.push(phoneNumber.formatInternational());

    result.formatted = formatted.find(f => removeFormatting(f) === typedValue);

    return result;
}

// eslint-disable-next-line jsdoc/require-description-complete-sentence
/**
 * Removes phone number formatting from given formatted string.
 *
 * Example:
 * +1 (342) 543 6767 => +13425436767.
 *
 * @param {string} formattedPhoneNumber - A pretty phone number string to be stripped of extra formatting.
 * @returns {string}
 */
function removeFormatting(formattedPhoneNumber) {
    return formattedPhoneNumber.replace(/[() -]/g, '');
}

/**
 * Displays numbers and an input for entering a phone number.
 *
 * @extends React.Component
 */
export class DialPad extends React.Component {
    static defaultProps = {
        initialCountryCode: 'US'
    };

    static propTypes = {
        initialCountryCode: PropTypes.string,
        onCountryCodeSelected: PropTypes.func,
        onPhoneAuthorizeFailed: PropTypes.func,
        onSubmit: PropTypes.func,
        phoneAuthorizeServiceUrl: PropTypes.string
    };

    /**
     * Initializes a new {@code DialPad} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            authorizePromise: undefined,

            /**
             * This is the country code that is passed to the parser as a default country. It's a hint for the parser
             * about the current country in case it's not explicitly specified in the phone number text.
             *
             * @type {string}
             */
            defaultCountryCode: props.initialCountryCode,

            showCountryCodePicker: false,

            /**
             * This state stores numbers/characters typed by the user on the dial pad.
             */
            typedValue: '',

            /**
             * This is the typed value formatted in to a phone number text with extra parenthesis, dashes and spaces
             * which make the phone number easier to read. This is passed over to the dial pad to display.
             */
            formattedPhone: '',

            /**
             * This is the output phone number in E.164 format. The value is set only if the currently typed text makes
             * for a callable phone number according to the parsing library.
             *
             * @type {undefined|string}
             * @private
             */
            outputPhoneNumber: undefined,

            /**
             * This is the country code that has been detected after parsing the currently entered phone number
             * text(even if not complete). This value is passed to the country code selector as the value to be
             * displayed in the UI as the currently selected country.
             *
             * @type {string}
             */
            parsedCountryCode: props.initialCountryCode
        };

        this._onChange = this._onChange.bind(this);
        this._onCountryCodeSelect = this._onCountryCodeSelect.bind(this);
        this._onToggleCountryCodePicker = this._onToggleCountryCodePicker.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <StatelessDialPad
                dialingInProgress = { typeof this.state.authorizePromise !== 'undefined' }
                disableCallButton = { typeof this.state.outputPhoneNumber !== 'string' }
                onChange = { this._onChange }
                onCountryCodeSelect = { this._onCountryCodeSelect }
                onSubmit = { this._onSubmit }
                onToggleCountryCodePicker = { this._onToggleCountryCodePicker }
                selectedCountryCode = { this.state.parsedCountryCode }
                showCountryCodePicker = { this.state.showCountryCodePicker }
                value = { this.state.formattedPhone } />
        );
    }

    /**
     * Callback invoked to update the known entered value of the dial pad.
     *
     * @param {string} value - The number that has been entered.
     * @private
     * @returns {void}
     */
    _onChange(value) {
        let newTypedValue = value;

        // A corner case for handling parenthesis deletion.
        // value = (512
        // this.state.formattedPhone = (512)
        // When the state above occurs it means that user has removed the last parenthesis by editing the input field.
        if (this.state.formattedPhone.replace(value, '') === ')') {
            newTypedValue = newTypedValue.slice(0, -1);
        }

        this._setTypedValue(removeFormatting(newTypedValue));
    }

    /**
     * Updates the pretty formatted phone number and clears any entered number
     * to begin entering a new number with the country code.
     *
     * @param {string} code - The country code representing the selected country.
     * @private
     * @returns {void}
     */
    _onCountryCodeSelect(code) {
        this.setState({
            defaultCountryCode: code,
            parsedCountryCode: code,
            showCountryCodePicker: false
        },
        () => {
            // Clear any value typed so far
            this._setTypedValue('');

            this.props.onCountryCodeSelected(code);
        });
    }

    /**
     * Callback invoked to show or hide country code selection.
     *
     * @private
     * @returns {void}
     */
    _onToggleCountryCodePicker() {
        this.setState({
            showCountryCodePicker: !this.state.showCountryCodePicker
        });
    }

    /**
     * Handles the submit action emitted by the {@link StatelessDialPad}.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        if (this.state.authorizePromise) {
            return;
        }

        const phoneNumber = this.state.outputPhoneNumber;

        if (!phoneNumber) {
            // This "should never happen" because the button is supposed to be disabled when the number is not valid
            logger.error('Not a valid phone number', { input: this.state.typedValue });

            return;
        }

        const { phoneAuthorizeServiceUrl } = this.props;
        const authorizePromise
            = phoneAuthorizeServiceUrl
                ? phoneAuthorize(phoneAuthorizeServiceUrl, phoneNumber)
                : Promise.resolve();

        authorizePromise.then(() => {
            this.props.onSubmit(
                getRandomMeetingName(),
                phoneNumber);
        }, error => {
            logger.error('Phone authorize request failed', { error });
            this.props.onPhoneAuthorizeFailed(phoneNumber);
        })
        .then(() => {
            this.setState({ authorizePromise: undefined });
        });

        this.setState({
            authorizePromise
        });
    }

    /**
     * Updates the typed phone number state and produces pretty formatted phone number output that is to be displayed
     * by the {@link StatelessDialPad}.
     *
     * @param {string} typedValue - A string which combines all characters typed in on the dial pad by the user.
     * @private
     * @returns {void}
     */
    _setTypedValue(typedValue) {
        const parsedPhone = parsePhoneNumber(typedValue, this.state.defaultCountryCode);

        this.setState({
            formattedPhone: parsedPhone?.formatted ?? typedValue,
            outputPhoneNumber: parsedPhone?.number,
            parsedCountryCode: parsedPhone?.country ?? this.state.defaultCountryCode,
            typedValue
        });
    }
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        /**
         * Handles the case when phone number is not allowed to be called.
         *
         * @param {string} phoneNumber - The phone number that has not been authorized.
         * @returns {void}
         */
        onPhoneAuthorizeFailed(phoneNumber) {
            dispatch(addNotification(
                'error',
                'appEvents.numberNotAllowed',
                { phoneNumber }
            ));
        },

        /**
         * Does things when country code is selected with the country picker.
         *
         * @param {string} countryCode - The country code selected by the user.
         * @returns {void}
         */
        onCountryCodeSelected(countryCode) {
            dispatch(setMostRecentCountryCode(countryCode));
        }
    };
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code DialPad}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const { phoneAuthorizeServiceUrl } = getSpotServicesConfig(state);
    const countryCode = getCountryCode(state);
    const mostRecentCountryCode = getMostRecentCountryCode(state);

    return {
        initialCountryCode: countryCode
            || mostRecentCountryCode
            || findCountryCodeForLanguage(navigator.language),
        phoneAuthorizeServiceUrl
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DialPad);
