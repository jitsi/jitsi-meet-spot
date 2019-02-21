import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendarEvents } from 'common/actions';
import { Clock, LoadingIcon, ScheduledMeetings } from 'common/ui';
import {
    getCalendarEmail,
    getCalendarEvents,
    getCurrentLock,
    getCurrentRoomName,
    getJoinCode,
    hasCalendarBeenFetched,
    isSetupComplete
} from 'common/reducers';
import { hasUpdatedEvents, windowHandler } from 'common/utils';

import { SettingsButton, WiredScreenshareRedirector } from './../components';
import { withCalendar, asSpotLoader } from './../loaders';

import SpotView from './spot-view';

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
        const joinCode = this.props.joinCode.toUpperCase();

        return (
            <SpotView name = 'home'>
                <WiredScreenshareRedirector>
                    <div className = 'spot-home'>
                        <Clock />
                        { this._getCalendarEventsView() }
                        { this.props.isSetupComplete
                            && <div
                                className = 'join-info'
                                data-qa-id = 'join-info'
                                onClick = { this._onOpenRemote }>
                                Connect at { windowHandler.getBaseUrl() } | Sharing key { joinCode }
                            </div> }
                    </div>
                    <div className = 'settings_cog'>
                        <SettingsButton />
                    </div>
                </WiredScreenshareRedirector>
            </SpotView>
        );
    }

    /**
     * Returns the React Component which should be dislayed for the list of
     * calendars.
     *
     * @returns {ReactComponent|null}
     */
    _getCalendarEventsView() {
        if (!this.props.isSetupComplete) {
            return this._renderSetupMessage();
        }

        if (this.props.hasFetchedEvents) {
            return this.props.events.length
                ? <ScheduledMeetings events = { this.props.events } />
                : this._renderNoEventsMessage();
        }

        return <LoadingIcon color = 'black' />;
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
        const url = `${baseUrl}#/?code=${this.props.joinCode.toUpperCase()}`;

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
                        Pair your remote and connect your calendar at
                        <div>{ windowHandler.getBaseUrl() }</div>
                    </div>
                </div>
                {
                    this.props.joinCode
                        && (
                            <div
                                className = 'setup-join-code'
                                data-qa-id = 'join-info'
                                onClick = { this._onOpenRemote }>
                                { this.props.joinCode.toUpperCase() }
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
