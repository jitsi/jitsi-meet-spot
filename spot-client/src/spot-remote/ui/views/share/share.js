import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { analytics, shareModeEvents } from 'common/analytics';
import {
    addNotification,
    getCurrentView,
    getInMeetingStatus,
    goToMeeting,
    hangUp,
    isConnectedToSpot,
    isWirelessScreensharingLocally,
    setLocalWirelessScreensharing,
    startWirelessScreensharing,
    stopScreenshare
} from 'common/app-state';
import { logger } from 'common/logger';
import { LoadingIcon, View } from 'common/ui';
import {
    getRandomMeetingName,
    isWirelessScreenshareSupported
} from 'common/utils';

import { NoSleep } from './../../../no-sleep';

import {
    ElectronDesktopPickerModal
} from './../../components';
import { withRemoteControl } from './../../loaders';

import ModeSelect from './mode-select';
import StopShare from './stop-share';

/**
 * Controls what UI components display while in Share mode.
 *
 * @extends React.PureComponent
 */
export class Share extends React.PureComponent {
    static propTypes = {
        dispatch: PropTypes.func,
        history: PropTypes.object,
        inMeeting: PropTypes.bool,
        isConnectedToSpot: PropTypes.bool,
        isScreenshareActiveRemotely: PropTypes.bool,
        isWirelessScreensharing: PropTypes.bool,
        remoteControlService: PropTypes.object
    };

    /**
     * Initializes a new {@code Share} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            autoPromptScreenshare: true,
            screensharePending: false
        };

        this._onClickStartWirelessScreenshare
            = this._onClickStartWirelessScreenshare.bind(this);
        this._onGoToSpotRemoveView = this._onGoToSpotRemoveView.bind(this);
        this._onStopWirelessScreenshare
            = this._onStopWirelessScreenshare.bind(this);
    }

    /**
     * Automatically start the screensharing flow. It is assumed if
     * {@code Share} is displayed for the first time it is to immediately
     * start screensharing.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (isWirelessScreenshareSupported()) {
            analytics.log(shareModeEvents.AUTO_START_SCREENSHARE);

            this._onStartWirelessScreenshare();
        }
    }

    /**
     * Navigates away from {@code Share} if not connected to a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidUpdate() {
        if (!this.props.isConnectedToSpot) {
            this.props.dispatch(addNotification('error', 'Disconnected'));
            this.props.history.push('/');
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <NoSleep>
                <View name = 'share-view'>
                    { this._renderSubView() }
                    <ElectronDesktopPickerModal />
                </View>
            </NoSleep>
        );
    }

    /**
     * Redirects to the full Spot-Remove view, exiting share mode.
     *
     * @private
     * @returns {void}
     */
    _onGoToSpotRemoveView() {
        analytics.log(shareModeEvents.ENTER_REMOTE_CONTROL_MODE);

        this.props.history.push('/remote-control');
    }

    /**
     * Returns the content to display within {@code Share}.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSubView() {
        if (this.state.screensharePending) {
            return <LoadingIcon color = 'white' />;
        }

        if (this.props.isWirelessScreensharing) {
            return (
                <StopShare
                    onStopScreenshare = { this._onStopWirelessScreenshare } />
            );
        }

        return (
            <ModeSelect
                isScreenshareActive = { this.props.isScreenshareActiveRemotely }
                isWirelessScreenshareSupported = { isWirelessScreenshareSupported() }
                onGoToSpotRemoveView = { this._onGoToSpotRemoveView }
                onStartWirelessScreenshare = { this._onClickStartWirelessScreenshare } />
        );
    }

    /**
     * Callback invoked to start the wireless screensharing flow.
     *
     * @private
     * @returns {void}
     */
    _onClickStartWirelessScreenshare() {
        analytics.log(shareModeEvents.SCREENSHARE_START);

        this._onStartWirelessScreenshare();
    }

    /**
     * Starts the wireless screensharing flow.
     *
     * @returns {void}
     */
    _onStartWirelessScreenshare() {
        if (this.props.isScreenshareActiveRemotely) {
            this.setState({ autoPromptScreenshare: false });

            return;
        }

        this.setState({
            screensharePending: true
        });

        if (this.props.inMeeting) {
            analytics.log(shareModeEvents.JOIN_EXISTING_MEETING);

            this.props.dispatch(startWirelessScreensharing(true))
                .catch(error =>
                    logger.warn('failed to start screenshare', { error }))
                .then(() => {
                    this.setState({
                        autoPromptScreenshare: false,
                        screensharePending: false
                    });
                });

            return;
        }

        analytics.log(shareModeEvents.CREATE_MEETING);

        this.props.dispatch(goToMeeting(
            getRandomMeetingName(),
            {
                startWithScreensharing: 'wireless',
                onClose: () =>
                    this.props.dispatch(setLocalWirelessScreensharing(false))
            })
        ).then(() => {
            this.props.dispatch(setLocalWirelessScreensharing(true));
        })
        .catch(() =>
            this.props.dispatch(setLocalWirelessScreensharing(false)))
        .then(() => {
            this.setState({
                autoPromptScreenshare: false,
                screensharePending: false
            });
        });
    }

    /**
     * Stops any screensharing in progress and hangs up, as the assumption in
     * share mode there is not a desire for Spot-TV in a meeting without having
     * screenshare be active.
     *
     * @private
     * @returns {void}
     */
    _onStopWirelessScreenshare() {
        analytics.log(shareModeEvents.SCREENSHARE_STOP);

        this.props.dispatch(stopScreenshare());

        // Pass true to immediately leave the meeting as share mode should not
        // display feedback entry.
        this.props.dispatch(hangUp(true));
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code Share}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const isWirelessScreensharing = isWirelessScreensharingLocally(state);
    const inMeetingState = getInMeetingStatus(state);

    return {
        inMeeting: Boolean(inMeetingState.inMeeting),
        isConnectedToSpot: isConnectedToSpot(state),
        isScreenshareActiveRemotely:
            !isWirelessScreensharing && Boolean(inMeetingState.screensharingType),
        isWirelessScreensharing,
        view: getCurrentView(state)
    };
}

export default withRemoteControl(connect(mapStateToProps)(Share));
