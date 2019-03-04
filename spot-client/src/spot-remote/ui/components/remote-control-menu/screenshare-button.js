import React from 'react';
import PropTypes from 'prop-types';

import { JitsiMeetJSProvider } from 'common/vendor';
import { NavButton } from '../nav';
import Popover from './popover';
import ScreensharePicker from './screenshare-picker';


/**
 * Displays a screensharing button. It toggles the screensharing on and off and allows to select
 * between wireless and wired.
 *
 * @extends React.Component
 */
export default class ScreenshareButton extends React.Component {
    static propTypes = {
        onStartWiredScreenshare: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func,
        remoteControlService: PropTypes.object,
        screensharing: PropTypes.bool,
        screensharingEnabled: PropTypes.bool
    };

    /**
     * Initializes a new {@code RemoteControlMenu} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            showScreensharePicker: false
        };

        this._onHideScreensharePicker = this._onHideScreensharePicker.bind(this);
        this._onToggleScreensharePicker = this._onToggleScreensharePicker.bind(this);
        this._onToggleScreensharing = this._onToggleScreensharing.bind(this);
        this._onToggleWirelessScreensharing = this._onToggleWirelessScreensharing.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            screensharing,
            screensharingEnabled
        } = this.props;
        const canWirelessScreenshare = JitsiMeetJSProvider.isWirelessScreenshareSupported();

        // If neither screensharing mode is allowed then show nothing.
        if (!screensharingEnabled && !canWirelessScreenshare) {
            return null;
        }

        // If screensharing is active and at least one mode is allowed then show
        // a stop button.
        if (screensharing) {
            return (
                <NavButton
                    iconName = 'stop_screen_share'
                    label = 'Stop Sharing'
                    onClick = { this._onToggleScreensharing } />
            );
        }

        // If only wired screensharing is enabled show only its button.
        if (screensharingEnabled && !canWirelessScreenshare) {
            return (
                <NavButton
                    className = 'screenshare'
                    iconName = 'screen_share'
                    label = 'Share Content'
                    onClick = { this._onToggleScreensharing } />
            );
        }

        // If only wireless screensharing is enabled show only its button.
        // if (true) {
        if (canWirelessScreenshare && !screensharingEnabled) {
            return (
                <NavButton
                    className = 'screenshare'
                    iconName = 'screen_share'
                    label = 'Share Content'
                    onClick = { this._onToggleWirelessScreensharing } />
            );
        }

        // If both screensharings are allowed but neither is active then show
        // a screenshare picker.
        return (
            <Popover
                onOutsideClick = { this._onHideScreensharePicker }
                popoverContent = {
                    <ScreensharePicker
                        onStartWiredScreenshare
                            = { this._onToggleScreensharing }
                        onStartWirelessScreenshare
                            = { this._onToggleWirelessScreensharing } />
                }
                showPopover = { this.state.showScreensharePicker }>
                <NavButton
                    iconName = 'screen_share'
                    label = 'Share Content'
                    onClick = { this._onToggleScreensharePicker } />
            </Popover>
        );
    }

    /**
     * Hides the screenshare picker.
     *
     * @private
     * @returns {void}
     */
    _onHideScreensharePicker() {
        this.setState({
            showScreensharePicker: false
        });
    }

    /**
     * Starts or stops local screensharing.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreensharing() {
        this._onHideScreensharePicker();

        if (this.props.onStartWiredScreenshare) {
            this.props.onStartWiredScreenshare();
        } else {
            this.props.remoteControlService.setScreensharing(!this.props.screensharing);
        }
    }

    /**
     * Changes whether the screenshare picker is displayed or not.
     *
     * @private
     * @returns {void}
     */
    _onToggleScreensharePicker() {
        this.setState({
            showScreensharePicker: !this.state.showScreensharePicker
        });
    }

    /**
     * Changes the current wireless screensharing state.
     *
     * @private
     * @returns {void}
     */
    _onToggleWirelessScreensharing() {
        this._onHideScreensharePicker();

        const {
            remoteControlService,
            screensharing
        } = this.props;

        if (this.props.onStartWirelessScreenshare) {
            this.props.onStartWirelessScreenshare();
        } else {
            remoteControlService.setWirelessScreensharing(!screensharing);
        }
    }
}
