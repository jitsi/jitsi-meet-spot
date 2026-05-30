import { HighlightOff, Search } from 'common/icons';
import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { withTranslation } from 'react-i18next';

import countriesInfo from './countriesInfo';

// FIXME verify all codes are actually ISO 3166-1 alpha-2 and verify which
// codes should be displayed.

interface CountryInfo {
    code: string;
    name: string;
    number: string;
}

interface Props {
    onCountryCodeSelect: (code: string, number: string) => void;
    t: (key: string) => string;
}

interface State {
    filter: string;
}

/**
 * Displays a list of country codes in ISO 3166-1 alpha-2 and provides a
 * search bar for filtering.
 */
export class CountryCodePicker extends React.PureComponent<Props, State> {
    /**
     * Initializes a new {@code CountryCodePicker} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        this.state = {
            filter: ''
        };

        this._onClearFilter = this._onClearFilter.bind(this);
        this._onFilterChange = this._onFilterChange.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns
     */
    render() {
        return (
            <div className = 'country-search'>
                <div className = 'search-bar'>
                    <div className = 'search-icon'>
                        <Search />
                    </div>
                    <input
                        onChange = { this._onFilterChange }
                        placeholder = { this.props.t('dial.searchCountry') }
                        value = { this.state.filter } />
                    <div
                        className = { `search-clear ${this.state.filter ? 'visible' : ''}` }
                        onClick = { this._onClearFilter }>
                        <HighlightOff />
                    </div>
                </div>
                <ul className = 'countries'>{ this._renderCountryInfo() }</ul>
            </div>
        );
    }

    /**
     * Callback invoked to set the filter to empty.
     *
     * @private
     * @returns
     */
    _onClearFilter() {
        this.setState({ filter: '' });
    }

    /**
     * Callback invoked when a listed country has been clicked. Takes a single
     * entry from {@code countriesInfo}.
     *
     * @param countryInfo - Contains information about the country,
     * including name, phone number prefix, and country code.
     * @private
     * @returns
     */
    _onCountryClick(countryInfo: CountryInfo) {
        this.props.onCountryCodeSelect(countryInfo.code, countryInfo.number);
    }

    /**
     * Callback invoked when the entered filter has been updated.
     *
     * @param e - The change event from the input.
     * @private
     * @returns
     */
    _onFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ filter: e.target.value });
    }

    /**
     * Creates the list of country information.
     *
     * @private
     * @returns
     */
    _renderCountryInfo() {
        const filter = this.state.filter.trim().toLowerCase();

        return (countriesInfo as CountryInfo[]).filter(countryInfo =>
            countryInfo.name.toLowerCase().includes(filter))
            .map(countryInfo => (
                <li
                    className = 'country'
                    key = { countryInfo.code }

                    onClick = { this._onCountryClick.bind(this, countryInfo) } >
                    <div className = 'flag-container'>
                        <ReactCountryFlag
                            className = 'country-flag'
                            countryCode = { countryInfo.code } />
                    </div>
                    <div className = 'country-name'>
                        { countryInfo.name }
                    </div>
                    <div className = 'country-number'>
                        { `+${countryInfo.number}` }
                    </div>
                </li>
            ));
    }
}

export default withTranslation()(CountryCodePicker);
