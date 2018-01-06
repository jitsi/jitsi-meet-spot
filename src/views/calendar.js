import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendarEvents } from 'actions';
import { google } from 'calendars';
import { Clock } from 'features/clock';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { QRCode } from 'features/qr-code';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import { getCalendarEvents, getCalendarName } from 'reducers';

import View from './view';
import styles from './view.css';

import { keyboardNavigation } from 'utils';

export class CalendarView extends React.Component {
    static propTypes = {
        calendarName: PropTypes.string,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        history: PropTypes.object
    };

    constructor(props) {
        super(props);

        this._onGoToMeeting = this._onGoToMeeting.bind(this);
        this._pollForEvents = this._pollForEvents.bind(this);

        this._isUnmounting = false;
    }

    componentDidMount() {
        keyboardNavigation.startListening('calendar');

        this._pollForEvents();

        this._updateEventsInterval = setInterval(this._pollForEvents, 30000);
    }

    componentWillUnmount() {
        keyboardNavigation.stopListening();

        this._isUnmounting = true;
        clearInterval(this._updateEventsInterval);
    }

    render() {
        return (
            <View>
                <div className = { styles.container }>
                    <Clock />
                    <MeetingNameEntry onSubmit = { this._onGoToMeeting } />
                    <div className = { styles.meetings }>
                        <ScheduledMeetings
                            onMeetingClick = { this._onGoToMeeting }
                            events = { this.props.events } />
                    </div>
                    <div className = { styles.code }>
                        <QRCode />
                    </div>
                </div>
            </View>
        );
    }

    _onGoToMeeting(meetingName = 'temp_placeholder') {
        this.props.history.push(`/meeting/${meetingName}`);
    }

    _pollForEvents() {
        const { calendarName } = this.props;

        if (!calendarName) {
            return;
        }

        google.getCalendar(calendarName)
            .then(events => {
                if (this._isUnmounting) {
                    return;
                }

                this.props.dispatch(setCalendarEvents(events));
            });
    }
}

function mapStateToProps(state) {
    return {
        calendarName: getCalendarName(state),
        events: getCalendarEvents(state) || []
    };
}

export default connect(mapStateToProps)(CalendarView);
