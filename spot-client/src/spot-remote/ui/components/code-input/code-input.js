import PropTypes from 'prop-types';
import React from 'react';

/**
 * A ReactComponent for entering a code in a UI where each character is in
 * a separate box. This component uses a hidden input and listens for key
 * strokes to update its UI, which works around WebView issues of the keyboard
 * being dismissed automatically whenever an input is blurred.
 *
 * @extends React.Component
 */
export default class CodeInput extends React.Component {
    static defaultProps = {
        length: 6,
        value: ''
    };

    static propTypes = {
        autoFocus: PropTypes.bool,
        forceUppercase: PropTypes.bool,
        length: PropTypes.number,
        onChange: PropTypes.func,
        onSubmit: PropTypes.func,
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
            currentIndex: 0,
            hasFocus: false
        };

        this._hiddenInputRef = React.createRef();

        this._onBlur = this._onBlur.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyPress = this._onKeyPress.bind(this);
        this._onTabFocus = this._onTabFocus.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div className = 'code-entry'>
                { this._renderBoxes() }
                <input
                    aria-hidden = { true }
                    autoFocus = { this.props.autoFocus }
                    className = 'hidden-input'
                    onBlur = { this._onBlur }
                    onFocus = { this._onTabFocus }
                    onKeyDown = { this._onKeyDown }
                    onKeyPress = { this._onKeyPress }
                    ref = { this._hiddenInputRef }
                    tabIndex = { -1 } />
            </div>
        );
    }

    /**
     * Helper to replace a character in the passed in value prop, at the index
     * set on currentIndex. The returned string will be padded to make sure the
     * new string length matches at least the currentIndex.
     *
     * @param {string} character - The character to use to replace the.
     * @private
     * @returns {string}
     */
    _changeCharacterAtCurrentIndex(character) {
        const { currentIndex } = this.state;
        const spaces = Math.max(
            this.state.currentIndex + 1,
            this.props.value.length
        );

        const newValue = ''.padEnd(spaces);
        const newValueParts = newValue.split('');

        return newValueParts.map((space, index) => {
            if (index === currentIndex) {
                return character;
            }

            return this.props.value[index] || space;
        }).join('');
    }

    /**
     * Callback invoked when focus is lost on the hidden input, likely because
     * of a click outside of {@code CodeInput}.
     *
     * @private
     * @returns {void}
     */
    _onBlur() {
        this.setState({
            hasFocus: false
        });
    }

    /**
     * Callback invoked when an individual code box is clicked so it can be
     * focused on.
     *
     * @param {number} index - The number of the box that was clicked.
     * @private
     * @returns {void}
     */
    _onBoxClick(index) {
        this.setState({
            currentIndex: index,
            hasFocus: true
        }, () => this._hiddenInputRef.current.focus());
    }

    /**
     * Callback invoked when a non-character key is pressed while focus is on
     * the hidden input.
     *
     * @param {KeyboardEvent} event - The native event emitted on key down.
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        const charCode = event.keyCode || event.which;

        switch (charCode) {

        // Backspace should delete the character in the current box or move
        // focus back one box.
        case 8: {
            const currentIndexHasCharacter
                = this.props.value[this.state.currentIndex];

            if (!currentIndexHasCharacter || !currentIndexHasCharacter.trim()) {
                this.setState({
                    currentIndex: Math.max(0, this.state.currentIndex - 1)
                }, () => this._onBlur());
            } else {
                this.props.onChange(this._changeCharacterAtCurrentIndex(' '));
            }

            break;
        }

        // Tab should proceed to the next box or allow tab focus to continue
        // forward in the dom.
        case 9: {
            if (event.shiftKey) {
                if (this.state.currentIndex === 0) {
                    return;
                }

                event.preventDefault();

                this.setState({
                    currentIndex: Math.max(0, this.state.currentIndex - 1)
                });
            } else {
                const isOnLastIndex
                    = this.state.currentIndex === (this.props.length - 1);

                if (isOnLastIndex) {
                    return;
                }

                event.preventDefault();

                this.setState({
                    currentIndex: Math.min(
                        this.props.length - 1, this.state.currentIndex + 1)
                });
            }

            break;
        }

        // Left arrow should move focus back one box.
        case 37:
            this.setState({
                currentIndex: Math.max(0, this.state.currentIndex - 1)
            });

            break;

        // Right arrow should move focus forward one box.
        case 39:
            this.setState({
                currentIndex: Math.min(
                    this.props.length - 1, this.state.currentIndex + 1)
            });

            break;

        // Delete should empty the character in the current box but keep focus
        // on the current box.
        case 46:
            this.props.onChange(this._changeCharacterAtCurrentIndex(' '));

            break;
        }
    }

    /**
     * Callback invoked when a character has been entered.
     *
     * @param {KeyboardEvent} event - The native event emitted on key press.
     * @private
     * @returns {void}
     */
    _onKeyPress(event) {
        const characterCode = event.keyCode || event.which;
        const characterString = String.fromCharCode(characterCode);

        if (!characterString || !characterString.trim()) {
            return;
        }

        event.preventDefault();

        this.props.onChange(
            this._changeCharacterAtCurrentIndex(characterString));

        this.setState({
            currentIndex: Math.min(
                this.props.length - 1, this.state.currentIndex + 1)
        });
    }

    /**
     * Callback invoked when the hidden input receives focus. This method exists
     * to support autofocus.
     *
     * @private
     * @returns {void}
     */
    _onTabFocus() {
        if (!this.state.hasFocus) {
            this._onBoxClick(this.state.currentIndex);
        }
    }

    /**
     * Creates the boxes UI to show the entered value so far and trigger
     * value editing.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderBoxes() {
        const { currentIndex, hasFocus } = this.state;
        const boxes = [];

        for (let i = 0; i < this.props.length; i++) {
            const showFocused = hasFocus && currentIndex === i;
            const classNames = `box ${showFocused ? 'active' : ''}`;

            boxes.push(
                <div
                    className = { classNames }
                    key = { i }
                    // eslint-disable-next-line react/jsx-no-bind
                    onFocus = { () => this._onBoxClick(i) }
                    tabIndex = { 0 }>
                    { this.props.value[i] || '' }
                </div>
            );
        }

        return boxes;
    }
}
