import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import {
    getCalendarError,
    getCalendarEvents,
    getDisplayName,
    getProductName,
    getRemoteJoinCode,
    hasCalendarBeenFetched,
    isSetupComplete
} from 'common/app-state';
import { UpdateTimeRangeChecker } from 'common/auto-update';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { COMMANDS, SERVICE_UPDATES } from 'common/remote-control';
import { Clock, LoadingIcon, ScheduledMeetings, FeedbackOpener } from 'common/ui';
import { getRandomMeetingName } from 'common/utils';

import { redirectToMeeting, setOkToUpdate } from '../../app-state';
import {
    JoinInfo,
    SettingsButton,
    WiredScreenshareChangeListener
} from './../components';
import { withCalendar } from './../loaders';

/**
 * A view of all known meetings in the calendar connected with Spot-TV.
 *
 * @extends React.Component
 */
export class Home extends React.Component {
    static defaultProps = {
        remoteJoinCode: ''
    };

    static propTypes = {
        calendarError: PropTypes.any,
        calendarService: PropTypes.object,
        enableAutoUpdate: PropTypes.bool,
        events: PropTypes.array,
        hasFetchedEvents: PropTypes.bool,
        history: PropTypes.object,
        isSetupComplete: PropTypes.bool,
        onGoToMeetingCommand: PropTypes.func,
        onStartScreenshareMeeting: PropTypes.func,
        onTimeWithinRangeUpdate: PropTypes.func,
        productName: PropTypes.string,
        remoteControlServer: PropTypes.object,
        remoteJoinCode: PropTypes.string,
        spotRoomName: PropTypes.string,
        t: PropTypes.func
    };

    /**
     * Initializes a new {@code Home} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            calendarError: null
        };

        this._onCommand = this._onCommand.bind(this);
    }

    /**
     * Registers listeners for updating the view's data and display.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Cleans up listeners for daemons and long-running updaters.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.remoteControlServer.removeListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            enableAutoUpdate,
            isSetupComplete: _isSetupComplete,
            spotRoomName
        } = this.props;

        return (
            <WiredScreenshareChangeListener
                onDeviceConnected = { this.props.onStartScreenshareMeeting }>
                { enableAutoUpdate
                    && <UpdateTimeRangeChecker
                        onTimeWithinRangeUpdate = { this.props.onTimeWithinRangeUpdate } /> }
                <div className = 'spot-home'>
                    <Clock />
                    <div className = 'room-name'>
                        { spotRoomName && <div>{ spotRoomName }</div> }
                    </div>
                    <div className = 'calendar-content'>
                        { this._getCalendarEventsView() }
                    </div>
                    {
                        _isSetupComplete
                            && <div className = 'spot-home-footer'>
                                <JoinInfo showDomain = { _isSetupComplete } />
                            </div>
                    }
                </div>
                <div className = 'admin-toolbar'>
                    <SettingsButton />
                </div>
                <div className = 'home-feedback'>
                    <FeedbackOpener />
                </div>
            </WiredScreenshareChangeListener>
        );
    }

    /**
     * Returns the React Component which should be displayed for the list of
     * calendars.
     *
     * @returns {ReactComponent|null}
     */
    _getCalendarEventsView() {
        if (!this.props.isSetupComplete) {
            return this._renderSetupMessage();
        }

        if (this.props.calendarError) {
            return this._renderError();
        }

        if (this.props.hasFetchedEvents) {
            return this.props.events.length
                ? <ScheduledMeetings events = { this.props.events } />
                : this._renderNoEventsMessage();
        }

        return <LoadingIcon />;
    }

    /**
     * Listens for Spot-Remotes commanding this Spot-TV to enter a meeting.
     *
     * @param {string} type - The type of the command being sent.
     * @param {Object} data - Additional data necessary to execute the command.
     * @private
     * @returns {void}
     */
    _onCommand(type, data) {
        switch (type) {
        case COMMANDS.GO_TO_MEETING: {
            this.props.onGoToMeetingCommand(data);
            break;
        }
        }
    }

    /**
     * Instantiates a React Element with a message stating calendar events could
     * not be fetched.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderError() {
        const { t } = this.props;

        return (
            <div className = 'no-events-message'>
                <div>{ t('calendar.errorGettingEvents') }</div>
                <div> { t('calendar.retrySync') }</div>
            </div>
        );
    }

    /**
     * Instantiates a React Element with a message stating there are no
     * scheduled meetings on the calendar associated with the Spot-TV.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderNoEventsMessage() {
        const { t } = this.props;

        return (
            <div className = 'no-events-message'>
                <div>{ t('calendar.noEvents') }</div>
                <div>{ t('calendar.inviteThisRoom') }</div>
            </div>
        );
    }

    /**
     * Instantiates a React Element with a message stating Spot-TV should have a
     * calendar connected.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderSetupMessage() {
        const { productName, remoteJoinCode, t } = this.props;

        return (
            <div className = 'no-events-message'>
                <h1>{ t('welcome', { productName }) }</h1>
                <div className = 'setup-instructions'>
                    <div>{ t('calendar.setupHeader') }</div>
                    <div>{ t('calendar.setupHow') }</div>

                </div>
                {
                    remoteJoinCode
                        && (
                            <div className = 'setup-join-code'>
                                <JoinInfo />
                            </div>
                        )
                }
            </div>
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Home}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        calendarError: getCalendarError(state),
        enableAutoUpdate: isBackendEnabled(state)
            && Boolean(getPermanentPairingCode(state)),
        events: getCalendarEvents(state),
        hasFetchedEvents: hasCalendarBeenFetched(state),
        isSetupComplete: isSetupComplete(state),
        productName: getProductName(state),
        remoteJoinCode: getRemoteJoinCode(state),
        spotRoomName: getDisplayName(state)
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
        onGoToMeetingCommand(data) {
            dispatch(redirectToMeeting(data.meetingName, {
                invites: data.invites,
                meetingDisplayName: data.meetingDisplayName,
                screenshare: data.startWithScreensharing === true,
                startWithVideoMuted: data.startWithVideoMuted === true
            }));
        },
        onStartScreenshareMeeting() {
            dispatch(redirectToMeeting(getRandomMeetingName(), { screenshare: true }));
        },
        onTimeWithinRangeUpdate(isWithinTimeRange) {
            dispatch(setOkToUpdate(isWithinTimeRange));
        }
    };
}

export default withRouter(
    withCalendar(
        connect(mapStateToProps, mapDispatchToProps)(
            withTranslation()(Home)
        )
    )
);
