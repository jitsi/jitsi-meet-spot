import PropTypes from 'prop-types';
import React from 'react';

/**
 * Displays an input for entering and showing the entered phone number.
 *
 * @extends React.Component
 */
export default class NumberInput extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        placeholder: PropTypes.string,
        readOnly: PropTypes.bool,
        value: PropTypes.string
    };

    /**
     * Initializes a new {@code NumberInput} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._inputRef = React.createRef();
    }

    /**
     * Ensures the latest value is displayed if in read only mode.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (this.props.readOnly && prevProps.value !== this.props.value) {
            this._inputRef.current.scrollLeft = this._inputRef.current.scrollWidth;
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
            <div className = 'number-input'>
                <input
                    onChange = { this.props.onChange }
                    placeholder = { this.props.placeholder }
                    readOnly = { this.props.readOnly }
                    ref = { this._inputRef }
                    type = 'tel'
                    value = { this.props.value } />
            </div>
        );
    }
}
