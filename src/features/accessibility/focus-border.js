import PropTypes from 'prop-types';
import React from 'react';

import styles from './accessibility.css';

/**
 * Renders a border around the currently focused element.
 *
 * @extends React.Component
 */
export default class FocusBorder extends React.Component {
    static propTypes = {
        children: PropTypes.any
    };

    /**
     * Initializes a new {@code FocusBorder} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onBlur = this._onBlur.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onHideBorder = this._onHideBorder.bind(this);

        this._setBorderRef = this._setBorderRef.bind(this);
        this._setMouseDown = this._setMouseDown.bind(this);
        this._setMouseUp = this._setMouseUp.bind(this);
    }

    /**
     * Initializes event listeners needed to manage border display state.
     *
     * @inhertidoc
     */
    componentDidMount() {
        document.addEventListener('mousedown', this._setMouseDown);
        document.addEventListener('mousemove', this._onHideBorder);
        document.addEventListener('mouseup', this._setMouseUp);

        window.addEventListener('blur', this._onBlur, true);
        window.addEventListener('focus', this._onFocus, true);

        window.addEventListener('popstate', this._onHideBorder);
    }

    /**
     * Removes event listeners that trigger updates to border display state.
     *
     * @inhertidoc
     */
    componentWillUnmount() {
        document.removeEventListener('mousedown', this._onHideBorder);
        document.removeEventListener('mouseup', this._onHideBorder);
        document.removeEventListener('mousemove', this._onHideBorder);

        window.removeEventListener('blur', this._onBlur);
        window.removeEventListener('focus', this._onFocus);
        window.removeEventListener('popstate', this._onHideBorder);
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
                className = { styles.focus }
                id = 'focus-border'
                ref = { this._setBorderRef }>
                { this.props.children }
            </div>
        );
    }

    /**
     * Hides the border if the window is no longer focused.
     *
     * @param {BlurEvent} event
     * @private
     * @returns {void}
     */
    _onBlur(event) {
        if (event.target === window || !document.activeElement) {
            this._onHideBorder();
        }
    }

    /**
     * Shows a border around the current active element if appropriate.
     *
     * @param {BlurEvent} event
     * @private
     * @returns {void}
     */
    _onFocus(event) {
        if (event.target === window || this._mouseDown) {
            return;
        }

        this._updateDisplay();
    }

    /**
     * Stops displaying the border.
     *
     * @private
     * @returns {void}
     */
    _onHideBorder() {
        if (this._focusBorder.style.display !== 'none') {
            this._focusBorder.style.display = 'none';
        }
    }

    /**
     * Sets an internal reference to the HTML element which shows the border.
     *
     * @param {HTMLDivElement} ref
     * @private
     * @returns {void}
     */
    _setBorderRef(ref) {
        this._focusBorder = ref;
    }

    /**
     * Sets the internal flag to mark the mouse is not being pressed down.
     *
     * @private
     * @returns {void}
     */
    _setMouseDown() {
        this._mouseDown = true;
        this._onHideBorder();
    }

    /**
     * Sets the internal flag to mark the mouse being pressed down.
     *
     * @private
     * @returns {void}
     */
    _setMouseUp() {
        this._mouseDown = false;
    }

    /**
     * Re-renders the border, moving its position on screen if necessary.
     *
     * @private
     * @returns {void}
     */
    _updateDisplay() {
        if (this._mouseDown) {
            this._onHideBorder();
        }

        const element = document.activeElement;
        const elementDetails = element.getBoundingClientRect();

        this._focusBorder.style.display = 'block';
        this._focusBorder.style.height = elementDetails.height;
        this._focusBorder.style.width = elementDetails.width;
        this._focusBorder.style.left = elementDetails.left;
        this._focusBorder.style.top = elementDetails.top;
    }
}
