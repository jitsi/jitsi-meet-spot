import PropTypes from 'prop-types';
import React from 'react';
import ReactCodeInput from 'react-code-input';

import { isAutoFocusSupported } from 'common/utils';

/**
 * A component for entering a code, with each character in a separate box.
 *
 * @extends React.Component
 */
export default class CodeInput extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.string
    };

    /**
     * Initializes a new {@code CodeInput} instance.
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
     * @returns {ReactElement}
     */
    render() {
        return (
            <ReactCodeInput
                autoFocus = { isAutoFocusSupported() }
                className = 'code-entry'
                fields = { 6 }
                onChange = { this._onChange }
                type = 'string'
                value = { this.props.value } />
        );
    }

    /**
     * Callback invoked when the entered code has been changed.
     *
     * @param {string} value - The value entered in the boxes.
     * @private
     * @returns {void}
     */
    _onChange(value) {
        this.props.onChange(value);
    }
}
