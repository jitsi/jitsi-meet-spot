import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendarEvents } from 'actions';
import { google } from 'calendars';
import { Clock } from 'features/clock';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import { getCalendarEvents, getCalendarName } from 'reducers';
import { keyboardNavigation } from 'utils';

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

        this._onGoToMeeting = this._onGoToMeeting.bind(this);
        this._pollForEvents = this._pollForEvents.bind(this);

        this._isUnmounting = false;
        this._updateEventsInterval = null;
    }

    componentDidMount() {
        keyboardNavigation.startListening('calendar');

        this._pollForEvents();

        this._updateEventsInterval = setInterval(this._pollForEvents, 30000);
    }

    componentWillUnmount() {
        this._isUnmounting = true;

        keyboardNavigation.stopListening();

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
                            events = { this.props.events }
                            onMeetingClick = { this._onGoToMeeting } />
                    </div>
                </div>
            </View>
        );
    }

    _onGoToMeeting(meetingName) {
        if (meetingName) {
            this.props.history.push(`/meeting/${meetingName}`);
        }
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
    }
}

function mapStateToProps(state) {
    return {
        calendarName: getCalendarName(state),
        events: getCalendarEvents(state) || []
    };
}

export default connect(mapStateToProps)(CalendarView);
