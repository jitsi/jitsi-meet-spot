import { AsYouType } from 'libphonenumber-js/max';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { logger } from 'common/logger';
import { getRandomMeetingName } from 'common/utils';

import { getCountryCode } from '../../../app-state';

import StatelessDialPad from './StatelessDialPad';

// eslint-disable-next-line jsdoc/require-description-complete-sentence
/**
 * Removes phone number formatting from given formatted string.
 *
 * Example:
 * +1 (342) 543 6767 => +13425436767
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
        countryCode: 'US'
    };

    static propTypes = {
        countryCode: PropTypes.string,
        onSubmit: PropTypes.func
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

            selectedCountryCode: props.countryCode
        };

        this._createAsYouType(props.countryCode);
        this._onChange = this._onChange.bind(this);
        this._onCountryCodeSelect = this._onCountryCodeSelect.bind(this);
        this._onToggleCountryCodePicker = this._onToggleCountryCodePicker.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
    }

    /**
     * Initializes the {@code AsYouType} utility for phone number fomratting with the given country code.
     *
     * @param {string} countryCode - ISO 3166-1 alpha-2 country code.
     * @private
     * @returns {void}
     */
    _createAsYouType(countryCode) {
        logger.log('Set dial pad country code', { countryCode });

        this._asYouType = new AsYouType(countryCode);

        if (!this._asYouType.country) {
            this._asYouType = new AsYouType(DialPad.defaultProps.countryCode);

            logger.error('Invalid country code - falling back to default', { countryCode });
        }
    }

    /**
     * Navigates away from the view {@code RemoteControl} when no longer
     * connected to a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (prevProps.countryCode !== this.props.countryCode) {
            this._createAsYouType(this.props.countryCode);

            // Clear any value typed so far
            this._setTypedValue('');
        }
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
                onChange = { this._onChange }
                onCountryCodeSelect = { this._onCountryCodeSelect }
                onSubmit = { this._onSubmit }
                onToggleCountryCodePicker = { this._onToggleCountryCodePicker }
                selectedCountryCode = { this.state.selectedCountryCode }
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
            selectedCountryCode: code,
            showCountryCodePicker: false
        },
        () => {
            this._createAsYouType(code);

            // Clear any value typed so far
            this._setTypedValue('');
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
        const phoneNumber = this._asYouType.getNumber();

        if (phoneNumber && phoneNumber.isValid()) {
            this.props.onSubmit(
                getRandomMeetingName(),
                phoneNumber.number);
        } else {
            logger.log('Not a valid phone number', { inout: this.state.typedValue });
        }
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
        this._asYouType.reset();

        let formattedPhone = this._asYouType.input(typedValue);
        let selectedCountryCode = this.state.selectedCountryCode;

        // If entered characters are removed by the "as you type" it means they do not add up to a valid phone number.
        // In this case skip the formatting and display the typed value directly.
        if (removeFormatting(formattedPhone) !== typedValue) {
            formattedPhone = typedValue;
        } else if (this._asYouType.country && this._asYouType.country !== this.state.selectedCountryCode) {
            logger.log('Dial pad detected another country code', {
                selectedCountryCode,
                detectedCountryCode: this._asYouType.country
            });
            selectedCountryCode = this._asYouType.country;
        }

        this.setState({
            selectedCountryCode,
            typedValue,
            formattedPhone
        });
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code DialPad}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        countryCode: getCountryCode(state)
    };
}

export default connect(mapStateToProps)(DialPad);
