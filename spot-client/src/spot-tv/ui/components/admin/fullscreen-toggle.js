import React from 'react';

import { Fullscreen, FullscreenExit } from 'common/icons';

/**
 * Shows a toggle link to enter and exit fullscreen mode.
 *
 * @extends React.Component
 */
export default class FullscreenToggle extends React.Component {
    /**
     * Initializes a new {@code FullscreenToggle} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            isFullscreen: Boolean(document.fullscreenElement)
        };

        this._onFullscreenChange = this._onFullscreenChange.bind(this);
        this._onToggleFullscreen = this._onToggleFullscreen.bind(this);
    }

    /**
     * Starts listening for fullscreen changes.
     *
     * @inheritdoc
     */
    componentDidMount() {
        document.addEventListener('fullscreenchange', this._onFullscreenChange);
    }

    /**
     * Stops listening for fullscreen changes.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        document.removeEventListener(
            'fullscreenchange', this._onFullscreenChange);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <a
                className = 'fullscreen-toggle'
                onClick = { this._onToggleFullscreen }>
                {
                    this.state.isFullscreen
                        ? <FullscreenExit />
                        : <Fullscreen />
                }
            </a>
        );
    }

    /**
     * Updates the current known state of being in fullscreen.
     *
     * @private
     * @returns {void}
     */
    _onFullscreenChange() {
        this.setState({
            isFullscreen: Boolean(document.fullscreenElement)
        });
    }

    /**
     * Enters or exits fullscreen mode.
     *
     * @private
     * @returns {void}
     */
    _onToggleFullscreen() {
        if (this.state.isFullscreen) {
            document.exitFullscreen();
        } else {
            document.body.requestFullscreen();
        }
    }
}

