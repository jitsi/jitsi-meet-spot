import PropTypes from 'prop-types';
import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { KeyboardArrowDown } from 'common/icons';
import countriesInfo from './countriesInfo';

/**
 * Displays a button with a country flag and country name based on a country code.
 *
 * @extends React.Component
 */
export default class CountryCodeButton extends React.PureComponent {
    /**
     * Initializes a new {@code CountryCodeButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._countryCodePickerTriggerRef = React.createRef();
    }

    /**
     * Checks if the {@code CountryCodeButton} instance contains the passed
     * in element.
     *
     * @param {Element} clickedElement - A DOM element to check is a child of
     * the {@code CountryCodeButton} instance.
     * @returns {boolean}
     */
    containsElement(clickedElement) {
        return this._countryCodePickerTriggerRef.current.contains(clickedElement);
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
                className = 'country-search-trigger'
                onClick = { this.props.onClick }
                ref = { this._countryCodePickerTriggerRef }
                type = 'button'>
                <ReactCountryFlag
                    className = 'country-flag'
                    code = { this.props.code } />
                <span className = 'country-search-trigger-name'>
                    { this._findNameFromList() }
                </span>
                <KeyboardArrowDown />
            </button>
        );
    }

    /**
     * Returns the name of the country which matches the country code in props.
     *
     * @private
     * @returns {string}
     */
    _findNameFromList() {
        const country = countriesInfo.find(info => info.code === this.props.code);

        return country ? country.name : '';
    }
}

CountryCodeButton.propTypes = {
    code: PropTypes.string,
    onClick: PropTypes.func
};
