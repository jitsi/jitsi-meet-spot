import PropTypes from 'prop-types';
import React from 'react';
import throttle from 'lodash.throttle';

/**
 * Encapsulates logic for detecting when the mouse cursor has not been moved for
 * a specified period (has become idle).
 *
 * @extends React.Component
 */
export class IdleCursorDetector extends React.Component {
    static defaultProps = {
        timeLimit: 5000
    };

    static propTypes = {
        children: PropTypes.node,
        onCursorIdleChange: PropTypes.func,
        timeLimit: PropTypes.number
    };

    /**
     * Initializes a new {@code IdleCursorDetector} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._hideTimeout = null;
        this._mouseIsIdle = true;

        this._onCursorMove = throttle(
            this._onCursorMove.bind(this),
            this.props.timeLimit / 4
        );
    }

    /**
     * Adds a listener to listen for cursor movement.
     *
     * @inheritdoc
     */
    componentDidMount() {
        window.addEventListener('mousemove', this._onCursorMove);
    }

    /**
     * Cleans up any processes for detecting cursor idleness.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearTimeout(this._hideTimeout);
        this._onCursorMove.cancel();
        window.removeEventListener('mousemove', this._onCursorMove);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return this.props.children;
    }

    /**
     * Updates the known idle state of the mouse and executes the
     * {@code onCursorIdleChange} if the state has changed.
     *
     * @param {boolean} isCursorIdle - Whether or not the cursor is now idle.
     * @private
     * @returns {void}
     */
    _maybeUpdateCursorIdleState(isCursorIdle) {
        if (this._isCursorIdle === isCursorIdle) {
            return;
        }

        this._isCursorIdle = isCursorIdle;

        this.props.onCursorIdleChange(isCursorIdle);
    }

    /**
     * Callback invoked when the mouse cursor is moved. Resets the timeout for
     * signaling an idle mouse.
     *
     * @private
     * @returns {void}
     */
    _onCursorMove() {
        clearTimeout(this._hideTimeout);

        this._hideTimeout = setTimeout(() => {
            this._maybeUpdateCursorIdleState(true);
        }, this.props.timeLimit);

        this._maybeUpdateCursorIdleState(false);
    }
}

export default IdleCursorDetector;
