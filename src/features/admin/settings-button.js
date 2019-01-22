import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import { IdleCursorDetector } from 'features/idle-cursor-detector';
import { ROUTES } from 'routing/constants';

import styles from './admin.css';

/**
 * A cog that directs to the settings view on click. It displays on mousemove
 * and autohides.
 */
class SettingsButton extends React.Component {
    static propTypes = {
        alwaysVisible: PropTypes.bool,
        autohideTimeout: PropTypes.number
    };

    static defaultProps = {
        alwaysVisible: false,
        autohideTimeout: 3000
    };

    state = {
        hovered: false,
        isCursorIdle: true
    };

    /**
     * Initializes a new {@code SettingsButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onCursorIdleChange = this._onCursorIdleChange.bind(this);
        this._onHoverDisplay = this._onHoverDisplay.bind(this);
        this._onHoverStop = this._onHoverStop.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const visibilityClass = this.props.alwaysVisible
            || !this.state.isCursorIdle
            || this.state.hovered
            ? '' : styles.hidden;

        return (
            <IdleCursorDetector
                onCursorIdleChange = { this._onCursorIdleChange }>
                <div
                    className = { `${styles.cog} ${visibilityClass}` }
                    onMouseOut = { this._onHoverStop }
                    onMouseOver = { this._onHoverDisplay }>
                    <Link to = { ROUTES.ADMIN } >
                        <i className = 'icon-settings' />
                    </Link>
                </div>
            </IdleCursorDetector>
        );
    }

    /**
     * Callback invoked to update the known idle state of the cursor.
     *
     * @param {boolean} isCursorIdle - Whether or not the cursor is idle.
     * @private
     * @returns {void}
     */
    _onCursorIdleChange(isCursorIdle) {
        this.setState({
            isCursorIdle
        });
    }

    /**
     * Sets {@code SettingsButton} to always be visible, preventing automatic
     * hiding.
     *
     * @private
     * @returns {void}
     */
    _onHoverDisplay() {
        this.setState({ hovered: true });
    }

    /**
     * Allows {@code SettingsButton} to automatically hide.
     *
     * @private
     * @returns {void}
     */
    _onHoverStop() {
        this.setState({ hovered: false });
    }
}

export default SettingsButton;
