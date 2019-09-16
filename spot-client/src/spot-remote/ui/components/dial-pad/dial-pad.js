import { AsYouType } from 'libphonenumber-js';
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
class DialPad extends React.Component {
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
            /**
             * This state stores numbers/characters typed by the user on the dial pad.
             */
            typedValue: '',

            /**
             * This is the typed value formatted in to a phone number text with extra parenthesis, dashes and spaces
             * which make the phone number easier to read. This is passed over to the dial pad to display.
             */
            formattedPhone: ''
        };

        this._createAsYouType(props.countryCode);

        this._onChange = this._onChange.bind(this);
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
        logger.log(`Init dial pad with country code: ${countryCode}`, { countryCode });

        this._asYouType = new AsYouType(countryCode);

        if (!this._asYouType.country) {
            this._asYouType = new AsYouType('US');

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
                onSubmit = { this._onSubmit }
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

        // If entered characters are removed by the "as you type" it means they do not add up to a valid phone number.
        // In this case skip the formatting and display the typed value directly.
        if (removeFormatting(formattedPhone) !== typedValue) {
            formattedPhone = typedValue;
        }

        this.setState({
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
    const countryCode = getCountryCode(state) || 'US';

    return {
        countryCode
    };
}

export default connect(mapStateToProps)(DialPad);
