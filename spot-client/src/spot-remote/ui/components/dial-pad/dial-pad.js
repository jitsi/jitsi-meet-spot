import React from 'react';

import StatelessDialPad from './StatelessDialPad';

/**
 * Displays numbers and an input for entering a phone number.
 *
 * @extends React.Component
 */
export default class DialPad extends React.Component {
    /**
     * Initializes a new {@code DialPad} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            value: ''
        };

        this._onChange = this._onChange.bind(this);
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
                { ...this.props }
                onChange = { this._onChange }
                value = { this.state.value }
                { ...this.props } />
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
        this.setState({ value });
    }
}
