import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays a dropdown for choosing a media device.
 *
 * @extends React.Component
 */
export default class Selector extends React.Component {
    static propTypes = {
        device: PropTypes.string,
        devices: PropTypes.array,
        onChange: PropTypes.func,
        type: PropTypes.string
    };

    /**
     * Initializes a new {@code Selector} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onChange = this._onChange.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            type,
            devices,
            device
        } = this.props;

        const selections = devices.map(({ label }) => (
            <option
                key = { label }
                value = { label }>
                { label }
            </option>
        ));

        if (!device) {
            selections.unshift(
                <option
                    key = 'default'
                    value = ''>
                    Please select a device
                </option>
            );
        }

        return (
            <div>
                Select a { type }:
                <select
                    key = { type }
                    onChange = { this._onChange }
                    value = { device }>
                    {
                        selections
                    }
                </select>
            </div>
        );
    }

    /**
     * Callback fired a new option has been selected.
     *
     * @param {ChangEvent} event - The change event fired by the select element.
     * @private
     * @returns {void}
     */
    _onChange(event) {
        this.props.onChange(event.target.value);
    }
}
