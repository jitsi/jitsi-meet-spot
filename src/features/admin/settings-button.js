import PropTypes from 'prop-types';
import React from 'react';
import throttle from 'lodash.throttle';
import { Link } from 'react-router-dom';

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
        visible: false
    };

    /**
     * Initializes a new {@code SettingsButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._hideTimeout = null;

        this._onMouseMoveDisplay = throttle(
            this._onMouseMoveDisplay.bind(this),
            props.autohideTimeout / 3
        );

        this._onHoverDisplay = this._onHoverDisplay.bind(this);
        this._onHoverStop = this._onHoverStop.bind(this);
    }

    /**
     * Adds a listener to automatically show {@SettingsButton} on mousemove.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (!this.props.alwaysVisible) {
            window.addEventListener('mousemove', this._onMouseMoveDisplay);
        }
    }

    /**
     * Cleans up any processes for automatically hiding or showing
     * {@code SettingsButton}.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        clearTimeout(this._hideTimeout);
        this._onMouseMoveDisplay.cancel();
        window.removeEventListener('mousemove', this._onMouseMoveDisplay);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const visibilityClass = this.props.alwaysVisible || this.state.visible
            ? '' : styles.hidden;

        return (
            <div
                className = { `${styles.cog} ${visibilityClass}` }
                onMouseOut = { this._onHoverStop }
                onMouseOver = { this._onHoverDisplay }>
                <Link to = { ROUTES.ADMIN } >
                    <i className = 'icon-settings' />
                </Link>
            </div>
        );
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
        this._onMouseMoveDisplay();
    }

    /**
     * Allows {@code SettingsButton} to automatically hide.
     *
     * @private
     * @returns {void}
     */
    _onHoverStop() {
        this.setState({ hovered: false });
        this._onMouseMoveDisplay();
    }

    /**
     * Sets {@code SettingsButton} to be visible now and automatically hide.
     *
     * @private
     * @returns {void}
     */
    _onMouseMoveDisplay() {
        clearTimeout(this._hideTimeout);

        this._hideTimeout = setTimeout(() => {
            if (!this.state.hovered) {
                this.setState({
                    visible: false
                });
            }
        }, this.props.autohideTimeout);

        this.setState({
            visible: true
        });
    }
}

export default SettingsButton;
