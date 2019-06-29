import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    dialOut,
    getInMeetingStatus,
    joinAdHocMeeting,
    joinScheduledMeeting,
    joinWithScreensharing
} from 'common/app-state';
import { AutoUpdateChecker } from 'common/auto-update';
import { isBackendEnabled } from 'common/backend';
import { isWirelessScreenshareSupported } from 'common/detection';
import { CalendarToday, Call, ScreenShare, Videocam } from 'common/icons';
import { logger } from 'common/logger';
import {
    Clock,
    RoomName,
    ScheduledMeetings
} from 'common/ui';
import { getRandomMeetingName } from 'common/utils';

import {
    getPermanentPairingCode,
    updateSpotRemoteSource
} from './../../../app-state';
import {
    DialPad,
    NavButton,
    NavContainer,
    ScreensharePicker,
    SelfFillingNameEntry
} from './../../components';

/**
 * Returns the React Element to display while the Spot-TV instance is not in a
 * meeting. Displays controls for starting a meeting.
 *
 * @extends React.PureComponent
 */
class WaitingForCallView extends React.Component {
    static propTypes = {
        _dispatchJoinWithScreensharing: PropTypes.func,
        _enableAutoUpdate: PropTypes.bool,
        _onDialOut: PropTypes.func,
        _onJoinAdHocMeeting: PropTypes.func,
        _onJoinScheduledMeeting: PropTypes.func,
        _onUpdateAvailable: PropTypes.func,
        events: PropTypes.array,
        wiredScreensharingEnabled: PropTypes.bool
    };

    /**
     * Initializes a new {@code WaitingForCallView} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'calendar'
        };

        this._onJoinWithWiredScreensharing
            = this._onJoinWithScreensharing.bind(this, /* wired */ false);
        this._onJoinWithWirelessScreensharing
            = this._onJoinWithScreensharing.bind(this, /* wireless */ true);
        this._onSetCalendarActive = this._onSetCalendarActive.bind(this);
        this._onSetDialActive = this._onSetDialActive.bind(this);
        this._onSetInputActive = this._onSetInputActive.bind(this);
        this._onSetScreenshareSelectActive
            = this._onSetScreenshareSelectActive.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { activeTab } = this.state;

        return (
            <div className = 'waiting-view'>
                { this.props._enableAutoUpdate
                    && <AutoUpdateChecker
                        onUpdateAvailable = { this.props._onUpdateAvailable } /> }
                <div className = 'view-header'>
                    <Clock />
                    <RoomName />
                </div>
                <div className = 'waiting-sub-view'>
                    { this._getSubView() }
                </div>
                <NavContainer>
                    <NavButton
                        active = { activeTab === 'calendar' }
                        label = 'Calendar'
                        onClick = { this._onSetCalendarActive }>
                        <CalendarToday />
                    </NavButton>
                    <NavButton
                        active = { activeTab === 'input' }
                        label = 'Meet Now'
                        onClick = { this._onSetInputActive }
                        qaId = 'meet-now'>
                        <Videocam />
                    </NavButton>
                    <NavButton
                        active = { activeTab === 'dial' }
                        label = 'Dial a Number'
                        onClick = { this._onSetDialActive }>
                        <Call />
                    </NavButton>
                    <NavButton
                        active = { activeTab === 'share' }
                        label = 'Share Content'
                        onClick = { this._onSetScreenshareSelectActive }
                        qaId = 'share-content'>
                        <ScreenShare />
                    </NavButton>
                </NavContainer>
            </div>
        );
    }

    /**
     * Returns the UI to display to based on the currently selected view from
     * the nav.
     *
     * @private
     * @returns {ReactComponent}
     */
    _getSubView() {
        const { activeTab } = this.state;

        logger.log('waitingForCall view updating', { activeTab });

        switch (activeTab) {
        case 'calendar':
            return (
                <ScheduledMeetings
                    events = { this.props.events }
                    onMeetingClick = { this.props._onJoinScheduledMeeting } />
            );
        case 'input':
            return (
                <div className = 'meeting-name-entry-view'>
                    <SelfFillingNameEntry
                        onSubmit = { this.props._onJoinAdHocMeeting } />
                </div>
            );
        case 'dial':
            return (
                <div className = 'number-entry-view'>
                    <DialPad onSubmit = { this.props._onDialOut } />
                </div>
            );
        case 'share':
            return (
                <div className = 'share-select-view modal-content'>
                    <ScreensharePicker
                        onStartWiredScreenshare
                            = { this._onJoinWithWiredScreensharing }
                        onStartWirelessScreenshare
                            = { this._onJoinWithWirelessScreensharing }
                        wiredScreenshareEnabled
                            = { this.props.wiredScreensharingEnabled }
                        wirelessScreenshareEnabled
                            = { isWirelessScreenshareSupported() } />
                </div>
            );
        }
    }

    /**
     * Updates the state to display the calendar view.
     *
     * @private
     * @returns {void}
     */
    _onSetCalendarActive() {
        this.setState({ activeTab: 'calendar' });
    }

    /**
     * Updates the state to display the dial in view.
     *
     * @private
     * @returns {void}
     */
    _onSetDialActive() {
        this.setState({ activeTab: 'dial' });
    }

    /**
     * Updates the state to display meeting name input.
     *
     * @private
     * @returns {void}
     */
    _onSetInputActive() {
        this.setState({ activeTab: 'input' });
    }

    /**
     * Automatically starts the wireless screensharing flow or, f both wireless
     * and wired screensharing are supported, displays the screenshare start
     * modal.
     *
     * @private
     * @returns {void}
     */
    _onSetScreenshareSelectActive() {
        // If only wireless sceensharing is available then start the wireless
        // screensharing flow.
        if (isWirelessScreenshareSupported()
            && !this.props.wiredScreensharingEnabled) {
            this._onJoinWithScreensharing(true);

            return;
        }

        // Otherwise defer all screensharing choices to the modal.
        this.setState({ activeTab: 'share' });
    }

    /**
     * Updates the state to display screenshare.
     *
     * @param {boolean} wireless - True for wireless or false for wired.
     * @private
     * @returns {void}
     */
    _onJoinWithScreensharing(wireless) {
        this.props._dispatchJoinWithScreensharing(
            getRandomMeetingName(),
            wireless ? 'wireless' : 'wired'
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code WaitingForCallView}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        ...getInMeetingStatus(state),
        _enableAutoUpdate: isBackendEnabled(state)
            && Boolean(getPermanentPairingCode(state))
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        _dispatchJoinWithScreensharing(meetingName, screensharingType) {
            dispatch(joinWithScreensharing(meetingName, screensharingType));
        },
        _onDialOut(meetingName, phoneNumber) {
            dispatch(dialOut(meetingName, phoneNumber));
        },
        _onJoinScheduledMeeting(meetingName) {
            dispatch(joinScheduledMeeting(meetingName));
        },
        _onJoinAdHocMeeting(meetingName) {
            dispatch(joinAdHocMeeting(meetingName));
        },
        _onUpdateAvailable() {
            dispatch(updateSpotRemoteSource());
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WaitingForCallView);
