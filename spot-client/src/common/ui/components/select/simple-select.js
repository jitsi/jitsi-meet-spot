import { FormControl, Input, MenuItem, Select } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

const classes = {
    select: 'select-trigger'
};
const menuProps = {
    classes: {
        paper: 'select-menu'
    },
    transitionDuration: 0
};

/**
 * Displays a custom select/dropdown element.
 *
 * @extends React.Component
 */
export default class SimpleSelect extends React.Component {
    static defaultProps = {
        value: ''
    };

    static propTypes = {
        onChange: PropTypes.func,
        options: PropTypes.array,
        placeholder: PropTypes.string,
        qaId: PropTypes.string,
        selected: PropTypes.object,
        value: PropTypes.any
    };

    /**
     * Initializes a new {@code SimpleSelect} instance.
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
        let menuItems = [];

        const isValuePresent = this._isValuePresent();

        if (!isValuePresent) {
            menuItems.push(this._renderPlaceholderMenuItem());
        }

        menuItems = [
            ...menuItems,
            ...this.props.options.map(this._renderMenuItem)
        ];

        return (
            <FormControl
                className = 'select'
                variant = 'filled'>
                <Select
                    MenuProps = { menuProps }
                    className = 'select-element'
                    classes = { classes }
                    data-qa-id = { this.props.qaId }
                    displayEmpty = { true }
                    input = { this._renderInput() }
                    onChange = { this._onChange }
                    value = { isValuePresent ? this.props.value : '' }
                    variant = 'filled'>
                    { menuItems }
                </Select>
            </FormControl>
        );
    }

    /**
     * Checks whether or not the passed in value is available in list of values.
     *
     * @private
     * @returns {boolean}
     */
    _isValuePresent() {
        return this.props.options.find(option => option.value === this.props.value);
    }

    /**
     * Creates the trigger element for the {@code Select}. By default
     * {@code Input} is already used but props cannot be passed to it.
     *
     * @returns {Input}
     */
    _renderInput() {
        return (
            <Input disableUnderline = { true } />
        );
    }

    /**
     * Callback fired when a new option has been selected.
     *
     * @param {ChangEvent} event - The change event fired by the select.
     * @private
     * @returns {void}
     */
    _onChange(event) {
        this.props.onChange(event.target.value);
    }

    /**
     * Instantiates an instance of {@code MenuItem} to display as an option
     * in the select dropdown.
     *
     * @param {Object} options - Values to bind to the option element.
     * @param {string} options.label - The string which should be displayed.
     * @param {*} options.value - The internal value of the option.
     * @private
     * @returns {MenuItem}
     */
    _renderMenuItem({ label, value }) {
        return (
            <MenuItem
                key = { label }
                value = { value }>
                { label || value }
            </MenuItem>
        );
    }

    /**
     * Instantiates an instance of {@code MenuItem} to be shown and selected
     * if there is no valid value.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderPlaceholderMenuItem() {
        return (
            <MenuItem
                disabled = { true }
                key = { this.props.placeholder }
                value = { '' }>
                { this.props.placeholder }
            </MenuItem>
        );
    }
}
