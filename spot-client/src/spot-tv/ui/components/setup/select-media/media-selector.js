import { SimpleSelect } from 'common/ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';


/**
 * Displays a select element for choosing a media device.
 */
export class MediaSelector extends React.Component {
    static propTypes = {
        device: PropTypes.string,
        devices: PropTypes.array,
        id: PropTypes.string,
        label: PropTypes.string,
        onChange: PropTypes.func,
        qaId: PropTypes.string,
        t: PropTypes.func
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
            id,
            devices,
            device,
            label: selectorLabel,
            t
        } = this.props;

        return (
            <div
                className = 'selector'
                id = { id }>
                <div className = 'select-label'>{ selectorLabel }</div>
                <SimpleSelect
                    onChange = { this._onChange }
                    options = { devices }
                    placeholder = { t('setup.selectDevice') }
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

export default withTranslation()(MediaSelector);
