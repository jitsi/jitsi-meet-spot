import React from 'react';

/**
 * The type of the props of {@link NumberInput}.
 */
interface IProps {

    /**
     * Additional CSS class name(s) to apply.
     */
    className?: string;

    /**
     * Where the input value gradient should start.
     */
    gradientStart?: string;

    /**
     * Callback invoked when the input value changes.
     */
    onChange?: (...args: any[]) => void;

    /**
     * Placeholder text to display when the input is empty.
     */
    placeholder?: string;

    /**
     * Whether the input is read only.
     */
    readOnly?: boolean;

    /**
     * The HTML input type (e.g. 'tel').
     */
    type?: string;

    /**
     * The current value of the input.
     */
    value?: string;
}

/**
 * Displays an input for entering and showing the entered phone number.
 */
export default class NumberInput extends React.Component<IProps> {
    _inputRef: React.RefObject<HTMLInputElement | null>;

    /**
     * Initializes a new {@code NumberInput} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._inputRef = React.createRef();
    }

    /**
     * Ensures the latest value is displayed if in read only mode.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps: IProps) {
        if (this.props.readOnly && prevProps.value !== this.props.value && this._inputRef.current) {
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
