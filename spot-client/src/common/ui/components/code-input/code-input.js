import PropTypes from 'prop-types';
import React from 'react';

import { isAutoFocusSupported } from 'common/utils';

import InputBox from './input-box';

/**
 * A mapping of keyboard key names to keyboard key codes for readability while
 * processing key codes.
 */
const keyCodes = {
    BACKSPACE_KEY: 8,
    LEFT_ARROW_KEY: 37,
    UP_ARROW_KEY: 38,
    RIGHT_ARROW_KEY: 39,
    DOWN_ARROW_KEY: 40
};

/**
 * A component for entering a code, with each character in a separate input.
 *
 * @extends React.Component
 */
export default class CodeInput extends React.Component {
    static defaultProps = {
        length: 6
    };

    static propTypes = {
        length: PropTypes.number,
        onChange: PropTypes.func,
        onEntryComplete: PropTypes.func,
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

        this.state = {

            /**
             * The value held in each individual {@code InputBox}.
             */
            inputValues: []
        };

        this._isAutoFocusSupported = isAutoFocusSupported();

        /**
         * A list of all the {@code InputBox} instances to control automatic
         * traversal.
         */
        this._inputRefs = [];

        this._onChange = this._onChange.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const inputBoxes = [];

        for (let i = 0; i < this.props.length; i++) {
            inputBoxes.push(
                this._renderInputBox(i, this.state.inputValues[i]));
        }

        return (
            <div className = 'code-entry'>
                { inputBoxes }
            </div>
        );
    }

    /**
     * Programmatically sets focus on the {@code InputBox} before the passed in
     * index, if available.
     *
     * @param {number} currentIndex - The index of the {@code InputBox} which
     * should lose focus so the box to the left can get focus.
     * @private
     * @returns {void}
     */
    _focusOnPreviousInputBox(currentIndex) {
        if (currentIndex > 0) {
            this._inputRefs[currentIndex - 1].focus();
        }
    }

    /**
     * Programmatically sets focus on the {@code InputBox} after the passed in
     * index, if available.
     *
     * @param {number} currentIndex - The index of the {@code InputBox} which
     * should lose focus so the box to the right can get focus.
     * @private
     * @returns {void}
     */
    _focusOnNextInputBox(currentIndex) {
        const nextInputBoxIndex = currentIndex + 1;

        if (nextInputBoxIndex < this.props.length) {
            this._inputRefs[nextInputBoxIndex].focus();
        } else {
            this.props.onEntryComplete();
        }
    }

    /**
     * Callback invoked when the value entered into an {@code InputBox} has
     * been updated.
     *
     * @param {number} index - The index of the entered code the
     * {@code InputBox} represents.
     * @param {string} value - The new value entered in the box.
     * @private
     * @returns {void}
     */
    _onChange(index, value) {
        this.setState({
            inputValues: this._replaceEnteredValue(index, value[0])
        }, () => {
            this._notifyOfChange();
            this._focusOnNextInputBox(index);
        });
    }

    /**
     * Callback invoked when a key has been typed into an {@code InputBox}.
     * Performs special navigation between the {@code InputBox} instances.
     *
     * @param {number} index - The position of the index {@code InputBox} which
     * received the keydown event.
     * @param {string} event - The keyboard event itself.
     * @private
     * @returns {void}
     */
    _onKeyDown(index, event) {
        switch (event.keyCode) {
        case keyCodes.BACKSPACE_KEY:
            event.preventDefault();

            if (this.state.inputValues[index]) {
                // If a value exists then delete the value but keep focus on the
                // current box.
                this.setState({
                    inputValues: this._replaceEnteredValue(index, '')
                }, () => this._notifyOfChange());
            } else {
                this._focusOnPreviousInputBox(index);
            }

            break;

        case keyCodes.LEFT_ARROW_KEY:
            event.preventDefault();
            this._focusOnPreviousInputBox(index);

            break;

        case keyCodes.RIGHT_ARROW_KEY:
            event.preventDefault();
            this._focusOnNextInputBox(index);

            break;

        case keyCodes.UP_ARROW_KEY:
        case keyCodes.DOWN_ARROW_KEY:
            event.preventDefault();
            break;

        default:
            break;
        }
    }

    /**
     * Instantiates an instance of {@code InputBox} for displaying and entering
     * a value.
     *
     * @param {number} index - The index of the {@code InputBox} in relation to
     * other {@code InputBox} instances.
     * @param {string} value - The value to display in the {@code InputBox}.
     * @private
     * @returns {InputBox}
     */
    _renderInputBox(index, value = '') {
        return (
            <InputBox
                autoFocus = { this._isAutoFocusSupported && index === 0 }
                index = { index }
                key = { index }
                onChange = { this._onChange }
                onFocus = { this._onFocus }
                onKeyDown = { this._onKeyDown }

                // TODO FIX
                // eslint-disable-next-line react/jsx-no-bind
                ref = { ref => {
                    this._inputRefs[index] = ref;
                } }
                value = { value } />
        );
    }

    /**
     * Formats the entered input and calls the {@code onChange} callback.
     *
     * @private
     * @returns {void}
     */
    _notifyOfChange() {
        const inputValuesWithSpaces = [];

        // Use a for-loop in case any values are "empty" and thus cannot be
        // iterated over.
        for (let i = 0; i < this.props.length; i++) {
            inputValuesWithSpaces.push(this.state.inputValues[i] || ' ');
        }

        this.props.onChange(inputValuesWithSpaces.join(''));
    }

    /**
     * Replace a the value of an index in the inputValues state.
     *
     * @param {number} index - The index within inputValues to be updated.
     * @param {string} character - The new value to be put into the index.
     * @private
     * @returns {void}
     */
    _replaceEnteredValue(index, character = '') {
        const copyOfInputValues = [ ...this.state.inputValues ];

        copyOfInputValues[index] = character;

        return copyOfInputValues;
    }
}
