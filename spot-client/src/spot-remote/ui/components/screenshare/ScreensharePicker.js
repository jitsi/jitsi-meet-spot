import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    getAdvertisementAppName,
    getShareDomain
} from 'common/app-state';
import { WiredScreenshare, WirelessScreenshare } from 'common/icons';
import { Button, RemoteJoinCode } from 'common/ui';
import { windowHandler } from 'common/utils';

import { NavButton } from '../nav';

/**
 * Displays information and prompts to start screensharing.
 *
 * @extends React.Component
 */
export class ScreensharePicker extends React.Component {
    static propTypes = {
        advertisedAppName: PropTypes.string,
        onStartWiredScreenshare: PropTypes.func,
        onStartWirelessScreenshare: PropTypes.func,
        onStopScreensharing: PropTypes.func,
        screensharingType: PropTypes.string,
        shareDomain: PropTypes.string,
        t: PropTypes.func,
        wiredScreenshareEnabled: PropTypes.bool,
        wirelessScreenshareEnabled: PropTypes.bool
    };

    /**
     * Ensures the screenshare select view displays when transitioning from
     * screensharing to not screensharing.
     *
     * @inheritdoc
     */
    static getDerivedStateFromProps(props) {
        if (props.screensharingType) {
            return {
                displayWirelessInstructions: false,
                displayWiredInstructions: false
            };
        }

        return null;
    }

    /**
     * Initializes a new {@code ScreensharePicker} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            displayWirelessInstructions: false,
            displayWiredInstructions: false
        };

        this._onShowStartWired = this._onShowStartWired.bind(this);
        this._onShowStartWireless = this._onShowStartWireless.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <div
                className = 'nav screenshare-select'
                data-qa-id = 'screenshare-picker'>
                { this._renderContent() }
            </div>
        );
    }

    /**
     * Sets the state to show instructions on how to start wired screensharing.
     *
     * @private
     * @returns {void}
     */
    _onShowStartWired() {
        this.setState({
            displayWiredInstructions: true,
            displayWirelessInstructions: false
        });
    }

    /**
     * Starts the wireless screensharing flow if supported. Otherwise sets the
     * state to show instructions on how to start wireless screensharing.
     *
     * @private
     * @returns {void}
     */
    _onShowStartWireless() {
        if (this.props.wirelessScreenshareEnabled) {
            this.props.onStartWirelessScreenshare();
        } else {
            this.setState({
                displayWiredInstructions: false,
                displayWirelessInstructions: true
            });
        }
    }

    /**
     * Helper for determining what view to display within the picker. The view
     * selects between screensharing instructions and stop states.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderContent() {
        // If screensharing is enabled, show a stop screensharing view.
        if (this.props.screensharingType) {
            return this._renderStopShare();
        }

        // If no screensharing is supported, show tips on how to screenshare
        // wirelessly. Intentionally ignore wired in case wired screenshare is
        // intentionally not supported.
        if (!this.props.wirelessScreenshareEnabled
            && !this.props.wiredScreenshareEnabled) {
            return this._renderWirelessScreenshareNotSupported();
        }

        // When wireless screenshare has been selected but not supported, then
        // display instructions on how to screenshare wirelessly.
        if (!this.props.wirelessScreenshareEnabled
            && this.state.displayWirelessInstructions) {
            return this._renderWirelessScreenshareNotSupported();
        }

        // If wired screenshare has been selected then show instructions on how
        // start wired screenshare.
        if (this.props.wiredScreenshareEnabled
            && this.state.displayWiredInstructions) {
            return this._renderStartWiredScreenshare();
        }

        // There are no instructions to display for starting a wireless
        // screenshare. Either the picker has been displayed or instructions
        // have been shown to go to another browser.

        // Default to choosing whether to start wired or wireless screensharing.
        return this._renderShareSelect();
    }

    /**
     * Displays a view to start either the wireless screensharing flow or the
     * wired screensharing flow.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderShareSelect() {
        const { t, wiredScreenshareEnabled } = this.props;

        return (
            <>
                <div className = 'title'>
                    { t('screenshare.pick') }
                </div>
                <div className = 'options'>
                    <NavButton
                        className = 'screenshare'
                        label = { t('screenshare.wireless') }
                        onClick = { this._onShowStartWireless }
                        qaId = 'start-wireless-screenshare'>
                        <WirelessScreenshare />
                    </NavButton>
                    { wiredScreenshareEnabled
                        && (
                            <NavButton
                                className = 'screenshare'
                                label = { t('screenshare.wired') }
                                onClick = { this._onShowStartWired }>
                                <WiredScreenshare />
                            </NavButton>
                        )
                    }
                </div>
            </>
        );
    }

    /**
     * Provides instructions on how to start a wired screenshare.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderStartWiredScreenshare() {
        const { onStartWiredScreenshare, t } = this.props;

        return (
            <>
                <div className = 'content'>
                    <div className = 'icon'>
                        <i className = 'material-icons'>wired_screen_share</i>
                    </div>
                    <div className = 'description'>
                        { t('screenshare.plugWired') }
                    </div>
                    <div className = 'sub-description'>
                        { t('screenshare.startManual') }
                    </div>
                </div>
                <div className = 'footer'>
                    <Button
                        appearance = 'subtle'
                        className = 'cta-button'
                        onClick = { onStartWiredScreenshare }>
                        { t('screenshare.shareNow') }
                    </Button>
                </div>
            </>
        );
    }

    /**
     * Renders a React Element to get confirmation for stopping a screenshare
     * in progress. The contents of the confirmation depends on the type of
     * screensharing in progress.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderStopShare() {
        const { onStopScreensharing, screensharingType, t } = this.props;
        const isWirelessScreensharing = screensharingType === 'proxy';
        const icon = isWirelessScreensharing
            ? 'wireless_screen_share'
            : 'wired_screen_share';

        let ctaTitle;

        if (isWirelessScreensharing) {
            ctaTitle = 'screenshare.stopWireless';
        } else if (screensharingType === 'device') {
            ctaTitle = 'screenshare.stopWired';
        } else {
            ctaTitle = 'screenshare.howToStop';
        }

        return (
            <>
                <div className = 'content'>
                    <div className = 'icon'>
                        <i className = 'material-icons'>{ icon }</i>
                    </div>
                    <div className = 'description'>
                        { t('screenshare.isSharing') }
                    </div>
                    <div className = 'sub-description'>
                        { t(ctaTitle) }
                    </div>
                </div>
                <div className = 'footer'>
                    <Button
                        appearance = 'subtle-danger'
                        className = 'cta-button'
                        onClick = { onStopScreensharing }
                        qaId = 'stop-share-button'>
                        { t('screenshare.stopSharing') }
                    </Button>
                </div>
            </>
        );
    }

    /**
     * Displays a view explaining how to screenshare wirelessly. The view
     * displays depends on the current browser environment.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderWirelessScreenshareNotSupported() {
        const { shareDomain, t } = this.props;

        return (
            <>
                <div className = 'content'>
                    <div className = 'icon'>
                        <i className = 'material-icons'>
                            wireless_screen_share
                        </i>
                    </div>
                    <div className = 'description'>
                        { t('screenshare.howToWireless') }
                    </div>
                </div>
                <div className = 'share-url'>
                    { `${shareDomain || windowHandler.getBaseUrl()}/` }
                    <RemoteJoinCode />
                </div>
            </>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code ScreensharePicker}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        advertisedAppName: getAdvertisementAppName(state),
        shareDomain: getShareDomain(state)
    };
}

export default connect(mapStateToProps)(withTranslation()(ScreensharePicker));
