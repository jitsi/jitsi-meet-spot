import PropTypes from 'prop-types';
import React from 'react';
import ReactCountryFlag from 'react-country-flag';

import countriesInfo from './countriesInfo';

// FIXME verify all codes are actually ISO 3166-1 alpha-2 and verify which
// codes should be displayed.

/**
 * Displays a list of country codes in ISO 3166-1 alpha-2 and provides a
 * search bar for filtering.
 *
 * @extends React.PureComponent
 */
export default class CountryCodePicker extends React.PureComponent {
    static propTypes = {
        onCountryCodeSelect: PropTypes.func
    };

    /**
     * Initializes a new {@code CountryCodePicker} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            filter: ''
        };

        this._onFilterChange = this._onFilterChange.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'country-search'>
                <div className = 'search-bar'>
                    <input
                        onChange = { this._onFilterChange }
                        placeholder = 'Search country/region' />
                </div>
                <ul className = 'countries'>{ this._renderCountryInfo() }</ul>
            </div>
        );
    }

    /**
     * Callback invoked when a listed country has been clicked. Takes a single
     * entry from {@code countriesInfo}.
     *
     * @param {Object} countryInfo - Contains information about the country,
     * including name, phone number prefix, and country code.
     * @private
     * @returns {void}
     */
    _onCountryClick(countryInfo) {
        this.props.onCountryCodeSelect(countryInfo.code, countryInfo.number);
    }

    /**
     * Callback invoked when the entered filter has been updated.
     *
     * @param {Object} e - The change event from the input.
     * @private
     * @returns {void}
     */
    _onFilterChange(e) {
        this.setState({ filter: e.target.value.trim() });
    }

    /**
     * Creates the list of country information.
     *
     * @private
     * @returns {Array<ReactElement>}
     */
    _renderCountryInfo() {
        return countriesInfo.filter(countryInfo =>
            countryInfo.name.toLowerCase().includes(this.state.filter))
            .map(countryInfo => (
                <li
                    key = { countryInfo.code }

                    // eslint-disable-next-line react/jsx-no-bind
                    onClick = { this._onCountryClick.bind(this, countryInfo) } >
                    <ReactCountryFlag
                        className = 'country-flag'
                        code = { countryInfo.code } />
                    { countryInfo.name }
                    { countryInfo.number }
                </li>
            ));
    }
}
