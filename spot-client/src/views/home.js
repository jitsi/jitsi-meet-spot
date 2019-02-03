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
    getCurrentRoomName,
    getJoinCode,
    hasCalendarBeenFetched,
    isSetupComplete
} from 'reducers';
import { windowHandler } from 'utils';

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
        joinCode: PropTypes.string,
        lock: PropTypes.string,
        remoteControlService: PropTypes.object,
        roomName: PropTypes.string
    };

    /**
     * Initializes a new {@code Home} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._onOpenRemote = this._onOpenRemote.bind(this);
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
                <div className = 'spot-home'>
                    <Clock />
                    { this._getCalendarEventsView() }
                    <div
                        className = 'join-info'
                        data-qa-id = 'join-info'
                        onClick = { this._onOpenRemote }>
                        Sharing key { this.props.joinCode.toUpperCase() }
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
                ? <ScheduledMeetings events = { this.props.events } />
                : <LoadingIcon color = 'black' />;
        }

        return null;
    }

    /**
     * Opens an instance of a remote control for the Spot in a new window. This
     * is a debug feature to immediately open the remote without entering a join
     * code.
     *
     * @private
     * @returns {void}
     */
    _onOpenRemote() {
        const baseUrl = windowHandler.getBaseUrl();
        const { roomName: room, lock } = this.props;
        const url = `${baseUrl}#/remote-control?remoteId=${room}&lock=${lock}`;

        windowHandler.openNewWindow(url);
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
        joinCode: getJoinCode(state),
        lock: getCurrentLock(state),
        roomName: getCurrentRoomName(state)
    };
}

export default asSpotLoader(withCalendar(connect(mapStateToProps)(Home)));
