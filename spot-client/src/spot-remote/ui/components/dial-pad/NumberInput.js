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
        value: PropTypes.string
    };

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
                    className = 'number-input'
                    onChange = { this.props.onChange }
                    placeholder = { this.props.placeholder }
                    type = 'tel'
                    value = { this.props.value } />
            </div>
        );
    }
}
