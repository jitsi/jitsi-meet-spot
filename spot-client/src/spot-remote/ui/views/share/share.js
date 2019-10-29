import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    getCurrentView,
    getInMeetingStatus,
    hangUp,
    isConnectedToSpot,
    isWirelessScreensharingLocally,
    isWirelessScreensharingPending,
    joinWithScreensharing,
    startWirelessScreensharing,
    stopScreenshare
} from 'common/app-state';
import { isWirelessScreenshareSupported } from 'common/detection';
import { LoadingIcon, RoomName, View } from 'common/ui';
import { getRandomMeetingName } from 'common/utils';

import { exitShareMode } from './../../../app-state';

import {
    ElectronDesktopPickerModal,
    WaitingForSpotTVOverlay
} from './../../components';
import { WithRemoteControl } from './../../loaders';

import ModeSelect from './mode-select';
import StopShare from './stop-share';

/**
 * Controls what UI components display while in share mode.
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
        isWirelessScreensharingPending: PropTypes.bool
    };

    /**
     * Initializes a new {@code Share} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props, /* Do not disconnect RCS - it might be a switch to the remote control view */false);

        this.state = {
            autoPromptScreenshare: true
        };

        this._onGoToSpotRemoteView = this._onGoToSpotRemoteView.bind(this);
        this._onStartWirelessScreenshare
            = this._onStartWirelessScreenshare.bind(this);
        this._onStopWirelessScreenshare
            = this._onStopWirelessScreenshare.bind(this);
    }

    /**
     * Automatically start the screensharing flow. It is assumed if
     * {@code Share} is displayed for the first time it should immediately
     * start screensharing.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (this.props.isConnectedToSpot) {
            this._onStartWirelessScreenshare();
        }
    }

    /**
     * Navigates away from the view {@code RemoteControl} when no longer
     * connected to a Spot-TV.
     *
     * @inheritdoc
     */
    componentDidUpdate(prevProps) {
        if (!prevProps.isConnectedToSpot
                && this.props.isConnectedToSpot
                && this.state.autoPromptScreenshare) {
            this._onStartWirelessScreenshare();
        }
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View name = 'share-view'>
                <WithRemoteControl disconnectOnUnmount = { false } >
                    <div className = 'share-view-contents'>
                        { this._renderSubView() }
                    </div>
                    <ElectronDesktopPickerModal />
                </WithRemoteControl>
            </View>
        );
    }

    /**
     * Redirects to the full Spot-Remove view, exiting share mode.
     *
     * @private
     * @returns {void}
     */
    _onGoToSpotRemoteView() {
        this.props.dispatch(exitShareMode());
    }

    /**
     * Returns the content to display within {@code Share}.
     *
     * @private
     * @returns {ReactComponent}
     */
    _renderSubView() {
        // FIXME log displayed view
        if (!this.props.isConnectedToSpot) {
            return <WaitingForSpotTVOverlay />;
        } else if (this.props.isWirelessScreensharingPending) {
            return <LoadingIcon />;
        }

        if (this.props.isWirelessScreensharing) {
            return (
                <StopShare
                    onStopScreenshare = { this._onStopWirelessScreenshare } />
            );
        }

        return (
            <>
                <div className = 'view-header'>
                    <RoomName />
                </div>
                <ModeSelect
                    isScreenshareActive = { this.props.isScreenshareActiveRemotely }
                    isWirelessScreenshareSupported = { isWirelessScreenshareSupported() }
                    onGoToSpotRemoveView = { this._onGoToSpotRemoteView }
                    onStartWirelessScreenshare = { this._onStartWirelessScreenshare } />
            </>
        );
    }

    /**
     * Starts the wireless screensharing flow.
     *
     * @returns {void}
     */
    _onStartWirelessScreenshare() {
        this.setState({
            autoPromptScreenshare: false
        });

        if (!isWirelessScreenshareSupported() || this.props.isScreenshareActiveRemotely) {

            return;
        }

        if (this.props.inMeeting) {
            this.props.dispatch(startWirelessScreensharing());

            return;
        }

        this.props.dispatch(joinWithScreensharing(getRandomMeetingName(), 'wireless'));
    }

    /**
     * Stops any screensharing in progress and hangs up, as the assumption in
     * share mode there is no desire for Spot-TV in a meeting without having
     * screenshare be active.
     *
     * @private
     * @returns {void}
     */
    _onStopWirelessScreenshare() {
        this.props.dispatch(stopScreenshare());

        // Share mode should never prompt for feedback. Also, share mode should
        // only hang up the meeting if there are no remote participants so that
        // the TV can stay in the call.
        this.props.dispatch(hangUp(true, true));
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
        isWirelessScreensharingPending: isWirelessScreensharingPending(state),
        view: getCurrentView(state)
    };
}

export default connect(mapStateToProps)(Share);
