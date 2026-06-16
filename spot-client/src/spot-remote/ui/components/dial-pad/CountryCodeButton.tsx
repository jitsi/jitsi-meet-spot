import { KeyboardArrowDown } from 'common/icons';
import React from 'react';
import ReactCountryFlag from 'react-country-flag';

import countriesInfo from './countriesInfo';

/**
 * The type of the React {@code Component} props of {@code CountryCodeButton}.
 */
interface IProps {

    /**
     * The country code whose flag and name should be displayed.
     */
    code?: string;

    /**
     * Callback invoked when the button is clicked.
     */
    onClick?: (...args: any[]) => void;
}

/**
 * Displays a button with a country flag and country name based on a country code.
 */
export default class CountryCodeButton extends React.PureComponent<IProps> {
    _countryCodePickerTriggerRef: React.RefObject<HTMLButtonElement | null>;

    /**
     * Initializes a new {@code CountryCodeButton} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._countryCodePickerTriggerRef = React.createRef();
    }

    /**
     * Checks if the {@code CountryCodeButton} instance contains the passed
     * in element.
     *
     * @param clickedElement - A DOM element to check is a child of
     * the {@code CountryCodeButton} instance.
     * @returns {boolean}
     */
    containsElement(clickedElement: Node): boolean {
        return Boolean(this._countryCodePickerTriggerRef.current?.contains(clickedElement));
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
                    countryCode = { this.props.code ?? '' } />
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
    _findNameFromList(): string {
        const country = countriesInfo.find((info: any) => info.code === this.props.code);

        return country ? country.name : '';
    }
}
