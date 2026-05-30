import throttle from 'lodash.throttle';
import React from 'react';

/**
 * The type of the React {@code Component} props of {@link IdleCursorDetector}.
 */
interface IProps {

    /**
     * The child elements to render.
     */
    children?: any;

    /**
     * Callback invoked when the idle state of the cursor changes.
     */
    onCursorIdleChange: (isCursorIdle: boolean) => void;

    /**
     * The amount of time, in milliseconds, the cursor must remain stationary
     * before being considered idle.
     */
    timeLimit: number;
}

/**
 * Encapsulates logic for detecting when the mouse cursor has not been moved for
 * a specified period (has become idle).
 */
export class IdleCursorDetector extends React.Component<IProps> {
    static defaultProps = {
        timeLimit: 5000
    };

    _hideTimeout: ReturnType<typeof setTimeout> | null;
    _mouseIsIdle: boolean;
    _isCursorIdle?: boolean;
    _onCursorMove: ReturnType<typeof throttle>;

    /**
     * Initializes a new {@code IdleCursorDetector} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this._hideTimeout = null;
        this._mouseIsIdle = true;

        this._onCursorMove = throttle(
            this._onCursorMoveHandler.bind(this),
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
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
        }
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
     * @param isCursorIdle - Whether or not the cursor is now idle.
     * @private
     * @returns {void}
     */
    _maybeUpdateCursorIdleState(isCursorIdle: boolean) {
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
    _onCursorMoveHandler() {
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
        }

        this._hideTimeout = setTimeout(() => {
            this._maybeUpdateCursorIdleState(true);
        }, this.props.timeLimit);

        this._maybeUpdateCursorIdleState(false);
    }
}

export default IdleCursorDetector;
