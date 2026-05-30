import { FormControl, Input, MenuItem, Select } from '@mui/material';
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

interface IOption {
    label?: string;
    value: any;
}

interface IProps {
    onChange?: (value: any) => void;
    options: IOption[];
    placeholder?: string;
    qaId?: string;
    selected?: any;
    value?: any;
}

/**
 * Displays a custom select/dropdown element.
 */
export default class SimpleSelect extends React.Component<IProps> {
    static defaultProps = {
        value: ''
    };

    /**
     * Initializes a new {@code SimpleSelect} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
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
        let menuItems: React.ReactNode[] = [];

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
     * @param event - The change event fired by the select.
     * @private
     * @returns {void}
     */
    _onChange(event: any) {
        this.props.onChange?.(event.target.value);
    }

    /**
     * Instantiates an instance of {@code MenuItem} to display as an option
     * in the select dropdown.
     *
     * @param options - Values to bind to the option element.
     * @param options.label - The string which should be displayed.
     * @param options.value - The internal value of the option.
     * @private
     * @returns {MenuItem}
     */
    _renderMenuItem({ label, value }: IOption) {
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
