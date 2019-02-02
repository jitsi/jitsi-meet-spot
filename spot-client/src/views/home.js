import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendarEvents } from 'actions';
import { hasUpdatedEvents } from 'calendars';
import { SettingsButton } from 'features/admin';
import { Clock } from 'features/clock';
import { LoadingIcon } from 'features/loading-icon';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import {
    getCalendarEmail,
    getCalendarEvents,
    getCurrentLock,
    hasCalendarBeenFetched,
    isSetupComplete
} from 'reducers';

import View from './view';
import { withCalendar, asSpotLoader } from './loaders';

/**
 * A view of all known meetings in the calendar connected with Spot. Provides
 * the ability to join those meetings and open a remote control instance.
 *
 * @extends React.Component
 */
export class Home extends React.Component {
    static propTypes = {
        calendarEmail: PropTypes.string,
        calendarService: PropTypes.object,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        hasFetchedEvents: PropTypes.bool,
        history: PropTypes.object,
        isSetupComplete: PropTypes.bool,
        lock: PropTypes.string,
        remoteControlService: PropTypes.object
    };

    /**
     * Initializes a new {@code Home} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onGoToMeeting = this._onGoToMeeting.bind(this);
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
        if (this.props.isSetupComplete) {
            this._pollForEvents();

            this._updateEventsInterval
                = setInterval(this._pollForEvents, 30000);
        }
    }

    /**
     * Cleans up listeners for daemons and long-running updaters.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._isUnmounting = true;

        clearInterval(this._updateEventsInterval);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        return (
            <View name = 'home'>
                <div className = 'homeContainer'>
                    <div className = 'clockContainer'>
                        <Clock />
                    </div>
                    <div className = 'meetings'>
                        { this._getCalendarEventsView() }
                    </div>
                </div>
                <div className = 'settings_cog'>
                    <SettingsButton />
                </div>
            </View>
        );
    }

    /**
     * Returns the React Component which should be dislayed for the list of
     * calendars.
     *
     * @returns {ReactComponent|null}
     */
    _getCalendarEventsView() {
        if (this.props.isSetupComplete) {
            return this.props.hasFetchedEvents
                ? <ScheduledMeetings
                    events = { this.props.events }
                    onMeetingClick = { this._onGoToMeeting } />
                : <LoadingIcon color = 'black' />;
        }

        return null;
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
        this.props.calendarService.getCalendar(calendarEmail)
            .then(events => {
                if (this._isUnmounting) {
                    return;
                }

                const {
                    dispatch,
                    events: previousEvents,
                    hasFetchedEvents,
                    remoteControlService
                } = this.props;

                if (!hasFetchedEvents
                        || hasUpdatedEvents(previousEvents, events)) {
                    dispatch(setCalendarEvents(events));
                    remoteControlService.notifyCalendarStatus(events);
                }
            });
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
        calendarEmail: getCalendarEmail(state),
        events: getCalendarEvents(state),
        hasFetchedEvents: hasCalendarBeenFetched(state),
        isSetupComplete: isSetupComplete(state),
        lock: getCurrentLock(state)
    };
}

export default asSpotLoader(withCalendar(connect(mapStateToProps)(Home)));
