import PropTypes from 'prop-types';
import React from 'react';

/**
 * A wrapper to make an element focusable using tab navigation.
 *
 * @extends React.Component
 */
export default class Navigatable extends React.Component {
    static propTypes = {
        children: PropTypes.any
    };

    /**
     * Initializes a new {@code Navigatable} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onKeyDown = this._onKeyDown.bind(this);
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
                { ...this.props }
                data-highlight-target = { true }
                onKeyDown = { this._onKeyDown }
                tabIndex = '0'>
                { this.props.children }
            </div>
        );
    }

    /**
     * Simulates a click in a hacky way.
     *
     * @param {KeyDownEvent} event
     * @private
     * @returns {void}
     */
    _onKeyDown(event) {
        if (event.keyCode === 13) {
            if (event.target.childElementCount === 1) {
                event.target.children[0].click();
            }
        }
    }
}
