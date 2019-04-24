import PropTypes from 'prop-types';
import React from 'react';

import { SimpleSelect } from 'common/ui';

/**
 * Displays a select element for choosing a media device.
 *
 * @extends React.Component
 */
export default class MediaSelector extends React.Component {
    static propTypes = {
        device: PropTypes.string,
        devices: PropTypes.array,
        label: PropTypes.string,
        onChange: PropTypes.func,
        qaId: PropTypes.string
    };

    /**
     * Initializes a new {@code MediaSelector} instance.
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
            devices,
            device,
            label: selectorLabel
        } = this.props;

        const selections = devices.map(({ label }) => {
            return {
                label,
                value: label
            };
        });

        return (
            <div className = 'selector'>
                <div className = 'select-label'>{ selectorLabel }</div>
                <SimpleSelect
                    onChange = { this._onChange }
                    options = { selections }
                    placeholder = 'Please select a device'
                    qaId = { this.props.qaId }
                    value = { device } />
            </div>
        );
    }

    /**
     * Callback fired when a media device has been selected.
     *
     * @param {string} value - The value from the the selected option.
     * @private
     * @returns {void}
     */
    _onChange(value) {
        this.props.onChange(value);
    }
}
