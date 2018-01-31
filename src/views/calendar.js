import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendarEvents } from 'actions';
import { google } from 'calendars';
import { Clock } from 'features/clock';
import { LoadingIcon } from 'features/loading-icon';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { QRCode } from 'features/qr-code';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import { Transmitter } from 'features/ultrasound';
import {
    getCalendarEvents,
    getCalendarName,
    getLocalRemoteControlId
} from 'reducers';
import { keyboardNavigation, windowHandler } from 'utils';

import { remoteControlService } from 'remote-control';

import View from './view';
import styles from './view.css';

export class CalendarView extends React.Component {
    static propTypes = {
        calendarName: PropTypes.string,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        localRemoteControlId: PropTypes.string,
        history: PropTypes.object
    };

    state = {
        hasLoadedEvents: false
    };

    constructor(props) {
        super(props);

        this._onCommand = this._onCommand.bind(this);
        this._onGoToMeeting = this._onGoToMeeting.bind(this);
        this._openQRCodeUrl = this._openQRCodeUrl.bind(this);
        this._pollForEvents = this._pollForEvents.bind(this);

        this._isUnmounting = false;
        this._updateEventsInterval = null;
    }

    componentDidMount() {
        keyboardNavigation.startListening('calendar');

        this._pollForEvents();

        this._updateEventsInterval = setInterval(this._pollForEvents, 30000);

        remoteControlService.addCommandListener(this._onCommand);
    }

    componentWillUnmount() {
        this._isUnmounting = true;

        remoteControlService.removeCommandListener(this._onCommand);

        keyboardNavigation.stopListening();

        clearInterval(this._updateEventsInterval);
    }

    render() {
        let contents;

        if (!this.state.hasLoadedEvents && !this.props.events.length) {
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
                    <MeetingNameEntry onSubmit = { this._onGoToMeeting } />
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
                    <div>
                        { remoteControlUrl
                            ? <Transmitter
                                hidden = { true }
                                interval = { 1000 }
                                transmission = { remoteControlUrl } />
                            : null }
                    </div>
                </div>
            </View>
        );
    }

    _getRemoteControlUrl() {
        const { localRemoteControlId } = this.props;

        if (!localRemoteControlId) {
            return '';
        }

        return `${windowHandler.getBaseUrl()}#/remote-control/${
            window.encodeURIComponent(localRemoteControlId)}`;
    }

    _onCommand(command, options) {
        if (command === 'goToMeeting') {
            this._onGoToMeeting(options.meetingName);
        } else if (command === 'requestCalendar') {
            remoteControlService.sendCommand(
                options.requester,
                'calendarData',
                { events: this.props.events });
        }
    }

    _onGoToMeeting(meetingName) {
        if (meetingName) {
            this.props.history.push(`/meeting/${meetingName}`);
        }
    }

    _openQRCodeUrl() {
        windowHandler.openNewWindow(this._getRemoteControlUrl());
    }

    _pollForEvents() {
        const { calendarName } = this.props;

        if (!calendarName) {
            return;
        }

        // TODO: prevent multiple requests being in flight at the same time
        google.getCalendar(calendarName)
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

function mapStateToProps(state) {
    return {
        calendarName: getCalendarName(state),
        events: getCalendarEvents(state) || [],
        localRemoteControlId: getLocalRemoteControlId(state)
    };
}

export default connect(mapStateToProps)(CalendarView);
