import PropTypes from 'prop-types';
import React from 'react';

import { isAutoFocusSupported } from 'common/detection';

/**
 * A mapping of keyboard key names to keyboard key codes for readability while
 * processing key codes.
 */
const keyCodes = {
    LEFT_ARROW_KEY: 37,
    UP_ARROW_KEY: 38,
    RIGHT_ARROW_KEY: 39,
    DOWN_ARROW_KEY: 40
};

/**
 * A component for entering a code, with each character in a separate box.
 *
 * @extends React.Component
 */
export default class CodeInput extends React.Component {
    static defaultProps = {
        length: 6
    };

    static propTypes = {
        length: PropTypes.number,
        onChange: PropTypes.func
    };

    /**
     * Initializes a new {@code CodeInput} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            isFocused: false,
            value: ''
        };

        this._inputRef = React.createRef();
        this._isAutoFocusSupported = isAutoFocusSupported();

        this._onBlur = this._onBlur.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onRootClick = this._onRootClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div
                className = 'code-entry'
                onClick = { this._onRootClick }>
                { this._renderBoxes() }
                { this._renderHiddenInput() }
            </div>
        );
    }

    /**
     * Callback invoked when the input has received focus. Hides the input
     * cursor.
     *
     * @private
     * @returns {void}
     */
    _onBlur() {
        this.setState({ isFocused: false });
    }

    /**
     * Callback invoked when the entered value of the input has been updated.
     *
     * @param {Object} event - The browser change event.
     * @private
     * @returns {void}
     */
    _onChange(event) {
        this.setState({ value: event.target.value }, () => {
            this.props.onChange(this.state.value);
        });
    }

    /**
     * Callback invoked when the input has received focus. Shows the cursor at
     * the end of the input.
     *
     * @private
     * @returns {void}
     */
    _onFocus() {
        // Prevent selection of the entire value when tabbed to focus
        if (this._inputRef.current) {
            setTimeout(() => {
                this._inputRef.current.selectionStart
                    = this._inputRef.current.selectionEnd
                    = this.state.value.length;
            });
        }

        this.setState({ isFocused: true });
    }

    /**
     * Callback invoked when a key has been typed into the input element.
     * Prevents cursor movement.
     *
     * @param {string} event - The keyboard event itself.
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        switch (event.keyCode) {
        case keyCodes.DOWN_ARROW_KEY:
        case keyCodes.LEFT_ARROW_KEY:
        case keyCodes.RIGHT_ARROW_KEY:
        case keyCodes.UP_ARROW_KEY:

            // Prevent moving the cursor.
            event.preventDefault();
            break;
        }
    }

    /**
     * Callback invoked the {@code CodeInput} component is clicked so focus
     * can be put onto the input.
     *
     * @private
     * @returns {void}
     */
    _onRootClick() {
        if (!this.state.isFocused) {
            this._inputRef.current.focus();
        }
    }

    /**
     * Instantiates instances of {@code InputBox} for displaying the entered
     * code.
     *
     * @private
     * @returns {Array<ReactElement>}
     */
    _renderBoxes() {
        const boxes = [];
        const focus = this.state.value.length;

        for (let i = 0; i < this.props.length; i++) {
            const className = `box ${focus === i && this.state.isFocused
                ? 'focused' : ''}`;

            boxes.push((
                <div
                    className = { className }
                    key = { i }>
                    { this.state.value[i] || '' }
                </div>
            ));
        }

        return boxes;
    }

    /**
     * Instantiates an HTMLInputElement which will hold the entered value.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderHiddenInput() {
        return (
            <input
                autoCapitalize = 'off'
                autoComplete = 'off'
                autoCorrect = 'off'
                autoFocus = { this._isAutoFocusSupported }
                maxLength = { this.props.length }
                onBlur = { this._onBlur }
                onChange = { this._onChange }
                onFocus = { this._onFocus }
                onKeyDown = { this._onKeyDown }
                ref = { this._inputRef }
                spellCheck = { false }
                value = { this.state.value } />
        );
    }
}
