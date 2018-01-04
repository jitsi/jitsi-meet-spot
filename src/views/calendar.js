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

export class CalendarView extends React.Component {
    static propTypes = {
        calendarName: PropTypes.string,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        history: PropTypes.object
    };

    constructor(props) {
        super(props);

        this._getFutureEvents = this._getFutureEvents.bind(this);
        this._onGoToMeeting = this._onGoToMeeting.bind(this);
        this._pollForEvents = this._pollForEvents.bind(this);

        this._isUnmounting = false;
    }

    componentDidMount() {
        this._pollForEvents();

        this._updateEventsInterval = setInterval(this._pollForEvents, 30000)
    }

    componentWillUnmount() {
        this._isUnmounting = true;
        clearInterval(this._updateEventsInterval);
    }

    render() {
        return (
            <View>
                <div className = { styles.container }>
                    <div>
                        <Clock />
                    </div>
                    <div>
                        <MeetingNameEntry onSubmit = { this._onGoToMeeting } />
                    </div>
                    <div className = { styles.meetings }>
                        <ScheduledMeetings
                            onMeetingClick = { this._onGoToMeeting }
                            events = { this._getFutureEvents() }
                        />
                    </div>
                    <div className = { styles.code }>
                        <QRCode />
                    </div>
                </div>
            </View>
        );
    }

    _getFutureEvents() {
        return this.props.events.filter(event => {
            if (!event.location.includes('meet.jit.si')) {
                return false;
            }

            const ending = new Date(event.end.dateTime);
            const now = new Date();

            return ending > now;
        });
    }

    _onGoToMeeting(meetingName = 'temp_placeholder') {
        this.props.history.push(`/meeting/${meetingName}`);
    }

    _pollForEvents() {
        google.getCalendar(this.props.calendarName)
            .then(events => {
                if (!this._isUnmounting) {
                    this.props.dispatch(setCalendarEvents(events));
                }
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
