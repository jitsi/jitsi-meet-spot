import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import {
    getCalendarError,
    getCalendarEvents,
    getDisplayName,
    getJoinCode,
    hasCalendarBeenFetched,
    isSetupComplete
} from 'common/app-state';
import { COMMANDS, SERVICE_UPDATES } from 'common/remote-control';
import { Clock, LoadingIcon, ScheduledMeetings } from 'common/ui';
import { getRandomMeetingName } from 'common/utils';

import {
    FullscreenToggle,
    JoinInfo,
    SettingsButton,
    WiredScreenshareChangeListener
} from './../components';
import { withCalendar } from './../loaders';

/**
 * A view of all known meetings in the calendar connected with Spot. Provides
 * the ability to join those meetings and open a remote control instance.
 *
 * @extends React.Component
 */
export class Home extends React.Component {
    static defaultProps = {
        joinCode: ''
    };

    static propTypes = {
        calendarError: PropTypes.any,
        calendarService: PropTypes.object,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        hasFetchedEvents: PropTypes.bool,
        history: PropTypes.object,
        isSetupComplete: PropTypes.bool,
        joinCode: PropTypes.string,
        remoteControlService: PropTypes.object,
        spotRoomName: PropTypes.string
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
        this._onRedirectToMeeting = this._onRedirectToMeeting.bind(this);
    }

    /**
     * Registers listeners for updating the view's data and display.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.remoteControlService.addListener(
            SERVICE_UPDATES.SPOT_REMOTE_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Cleans up listeners for daemons and long-running updaters.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.remoteControlService.removeListener(
            SERVICE_UPDATES.SPOT_REMOTE_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <WiredScreenshareChangeListener
                onDeviceConnected = { this._onRedirectToMeeting }>
                <div className = 'spot-home'>
                    <Clock />
                    { this._getCalendarEventsView() }
                    { this.props.isSetupComplete
                        && <div className = 'spot-home-footer'>
                            { this.props.spotRoomName } | Sharing Key <JoinInfo />
                        </div> }
                </div>
                <div className = 'admin-toolbar'>
                    <FullscreenToggle />
                    <SettingsButton />
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

        return <LoadingIcon color = 'black' />;
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
            let path = `/meeting?location=${data.meetingName}`;

            if (data.invites) {
                path += `&invites=${JSON.stringify(data.invites)}`;
            }

            if (data.startWithScreensharing) {
                path += '&screenshare=true';
            }

            if (data.startWithVideoMuted === true) {
                path += '&startWithVideoMuted=true';
            }

            this.props.history.push(path);

            break;
        }
        }
    }

    /**
     * Proceeds into a random meeting with screensharing enabled.
     *
     * @private
     * @returns {void}
     */
    _onRedirectToMeeting() {
        const meetingName = getRandomMeetingName();

        this.props.history.push(
            `/meeting?location=${meetingName}&screenshare=true`);
    }

    /**
     * Instantiates a ReactElement with a message stating calendar events could
     * not be fetched.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderError() {
        return (
            <div className = 'no-events-message'>
                <div>Unable to get calendar events.</div>
                <div>
                   Please try reconnecting to the room's calendar.
                </div>
            </div>
        );
    }

    /**
     * Instantiates a ReactElement with a message stating there are no scheduled
     * meetings on the calendar associated with the Spot.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderNoEventsMessage() {
        return (
            <div className = 'no-events-message'>
                <div>There are no scheduled meetings.</div>
                <div>
                    Invite this room to your calendar event
                    and you'll be set
                </div>
            </div>
        );
    }

    /**
     * Instantiates a ReactElement with a message stating Spot should have a
     * calendar connected.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderSetupMessage() {
        return (
            <div className = 'no-events-message'>
                <h1>Welcome to Spot!</h1>
                <div className = 'setup-instructions'>
                    <div>You're almost set</div>
                    <div>
                        Pair your remote and connect your calendar.
                    </div>
                </div>
                {
                    this.props.joinCode
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
        events: getCalendarEvents(state),
        hasFetchedEvents: hasCalendarBeenFetched(state),
        isSetupComplete: isSetupComplete(state),
        joinCode: getJoinCode(state),
        spotRoomName: getDisplayName(state)
    };
}

export default withRouter(withCalendar(connect(mapStateToProps)(Home)));
