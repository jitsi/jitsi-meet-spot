import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendarEvents } from 'actions';
import { calendarService } from 'calendars';
import { Clock } from 'features/clock';
import { LoadingIcon } from 'features/loading-icon';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { QRCode } from 'features/qr-code';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import {
    getCalendarEmail,
    getCalendarEvents,
    getLocalRemoteControlId,
    isSetupComplete
} from 'reducers';
import { remoteControlService } from 'remote-control';
import { keyboardNavigation, windowHandler } from 'utils';

import View from './view';
import styles from './view.css';
import { withCalendar, withRemoteControl } from './loaders';

/**
 * A view of all known meetings in the calendar connected with Spot. Provides
 * the ability to join those meetings and open a remote control instance.
 *
 * @extends React.Component
 */
export class Calendar extends React.Component {
    static propTypes = {
        calendarEmail: PropTypes.string,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        isSetupComplete: PropTypes.bool,
        localRemoteControlId: PropTypes.string,
        history: PropTypes.object
    };

    state = {
        hasLoadedEvents: false
    };

    /**
     * Initializes a new {@code Meeting} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onCommand = this._onCommand.bind(this);
        this._onGoToMeeting = this._onGoToMeeting.bind(this);
        this._openQRCodeUrl = this._openQRCodeUrl.bind(this);
        this._pollForEvents = this._pollForEvents.bind(this);

        this._isUnmounting = false;
        this._updateEventsInterval = null;
    }

    /**
     * Registers listeners for updating the view's data and display.
     *
     * @inheritdoc
     */
    componentDidMount() {
        keyboardNavigation.startListening('calendar');

        if (this.props.isSetupComplete) {
            this._pollForEvents();

            this._updateEventsInterval
                = setInterval(this._pollForEvents, 30000);
        }

        remoteControlService.addCommandListener(this._onCommand);
    }

    /**
     * Cleans up listeners for daemons and long-running updaters.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._isUnmounting = true;

        remoteControlService.removeCommandListener(this._onCommand);

        keyboardNavigation.stopListening();

        clearInterval(this._updateEventsInterval);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        let contents;

        if (this.props.isSetupComplete
            && !this.state.hasLoadedEvents
            && !this.props.events.length) {
            contents = <LoadingIcon color = 'white' />;
        } else {
            contents = <ScheduledMeetings
                events = { this.props.events }
                onMeetingClick = { this._onGoToMeeting } />;
        }

        const remoteControlUrl = this._getRemoteControlUrl();

        return (
            <View name = 'calendar'>
                <div className = { styles.container }>
                    <Clock />
                    <MeetingNameEntry
                        onSubmit = { this._onGoToMeeting } />
                    <div className = { styles.meetings }>
                        { contents }
                    </div>
                    <div
                        className = { styles.qrcode }
                        onClick = { this._openQRCodeUrl }>
                        { remoteControlUrl
                            ? <QRCode text = { remoteControlUrl } />
                            : null }
                    </div>
                </div>
            </View>
        );
    }

    /**
     * Generates the full URL for opening a remote control for Spot.
     *
     * @private
     * @returns void
     */
    _getRemoteControlUrl() {
        const { localRemoteControlId } = this.props;

        if (!localRemoteControlId) {
            return '';
        }

        return `${windowHandler.getBaseUrl()}#/remote-control/${
            window.encodeURIComponent(localRemoteControlId)}`;
    }

    /**
     * Listens for and reacts to commands from remote controllers.
     *
     * @param {string} command - The type of the command.
     * @param {Object} options - Additional information about how to execute the
     * command.
     * @private
     * @returns {void}
     */
    _onCommand(command, options) {
        switch (command) {
        case 'goToMeeting':
            this._onGoToMeeting(options.meetingName);
            break;
        case 'requestCalendar':
            remoteControlService.sendCommand(
                options.requester,
                'calendarData',
                { events: this.props.events });
            break;
        }
    }

    /**
     * Callback invoked to join a meeting. Only if a meeting url is passed in
     * will join be attempted.
     *
     * @param {string} meetingUrl - The meeting url to join.
     * @private
     * @returns {void}
     */
    _onGoToMeeting(meetingUrl) {
        if (meetingUrl) {
            this.props.history.push(`/meeting?location=${meetingUrl}`);
        }
    }

    /**
     * Callback invoked to open a window for controlling a Spot instance. This
     * is intended for now to be a debugging and development feature.
     *
     * @private
     * @returns {void}
     */
    _openQRCodeUrl() {
        windowHandler.openNewWindow(this._getRemoteControlUrl());
    }

    /**
     * Fetches the latest calendar data and updates the internal state of known
     * calendar events.
     *
     * @private
     * @returns {void}
     */
    _pollForEvents() {
        const { calendarEmail } = this.props;

        if (!calendarEmail) {
            return;
        }

        // TODO: prevent multiple requests being in flight at the same time
        calendarService.getCalendar(calendarEmail)
            .then(events => {
                if (this._isUnmounting) {
                    return;
                }

                this.props.dispatch(setCalendarEvents(events));
            });

        if (!this.state.hasLoadedEvents) {
            this.setState({ hasLoadedEvents: true });
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of
 * {@code Calendar}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        calendarEmail: getCalendarEmail(state),
        events: getCalendarEvents(state) || [],
        isSetupComplete: isSetupComplete(state),
        localRemoteControlId: getLocalRemoteControlId(state)
    };
}

export default withRemoteControl(withCalendar(
    connect(mapStateToProps)(Calendar)));
