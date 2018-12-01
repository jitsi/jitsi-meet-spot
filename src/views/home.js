import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { setCalendarEvents } from 'actions';
import { calendarService } from 'calendars';
import { SettingsButton } from 'features/admin';
import { Clock } from 'features/clock';
import { LoadingIcon } from 'features/loading-icon';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { QRCode } from 'features/qr-code';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import {
    getCalendarEmail,
    getCalendarEvents,
    getCurrentLock,
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
export class Home extends React.Component {
    static propTypes = {
        calendarEmail: PropTypes.string,
        dispatch: PropTypes.func,
        events: PropTypes.array,
        isSetupComplete: PropTypes.bool,
        localRemoteControlId: PropTypes.string,
        lock: PropTypes.string,
        history: PropTypes.object
    };

    state = {
        hasCompletedInitialCalendarFetch: false
    };

    /**
     * Initializes a new {@code Home} instance.
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
        const remoteControlUrl = this._getRemoteControlUrl();

        return (
            <View name = 'home'>
                <div className = { styles.container }>
                    <Clock />
                    <MeetingNameEntry
                        onSubmit = { this._onGoToMeeting } />
                    <div className = { styles.meetings }>
                        {
                            this._showCalendarLoadingIcon()
                                ? <LoadingIcon color = 'white' />
                                : <ScheduledMeetings
                                    events = { this.props.events }
                                    onMeetingClick = { this._onGoToMeeting } />
                        }
                    </div>
                    <div
                        className = { styles.qrcode }
                        data-qa-id = 'remote-control-link'
                        onClick = { this._openQRCodeUrl }>
                        { remoteControlUrl
                            ? <QRCode text = { remoteControlUrl } />
                            : null }
                    </div>
                    <div className = { styles.joinInfo }>
                        { `${this.props.localRemoteControlId} code: ${
                            this.props.lock}` }
                    </div>
                    <div className = { styles.settings_cog }>
                        <SettingsButton />
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
        const { localRemoteControlId, lock } = this.props;

        if (!localRemoteControlId) {
            return '';
        }

        return `${windowHandler.getBaseUrl()}#/remote-control/${
            window.encodeURIComponent(localRemoteControlId)}?lock=${lock}`;
    }

    /**
     * Listens for and reacts to commands from remote controllers.
     *
     * @param {string} command - The type of the command.
     * @param {string} from - The full jid of the sender of the command.
     * @param {Object} data - Additional information about how to execute the
     * command.
     * @private
     * @returns {void}
     */
    _onCommand(command, from, data) {
        switch (command) {
        case 'goToMeeting':
            this._onGoToMeeting(data.meetingName);
            break;
        case 'requestCalendar': {
            const resource = from.split('/')[1];

            remoteControlService.sendCommand(
                resource,
                'calendarData',
                { events: this.props.events }
            );
            break;
        }
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

                if (!this.state.hasCompletedInitialCalendarFetch) {
                    this.setState({ hasCompletedInitialCalendarFetch: true });
                }
            });
    }

    /**
     * Returns whether or not events have been loaded yet or attempted to be
     * loaded.
     *
     * @boolean
     * @private
     */
    _showCalendarLoadingIcon() {
        if (!this.props.isSetupComplete) {
            // Only when setup is complete is there calendar data to load.
            return false;
        }

        // If there is data already cached, then it should be shown instead of
        // the loading icon.
        if (this.props.events.length) {
            return false;
        }

        // If there is no cache, show the icon based on the state of initial
        // calendar fetch request since mount.
        return !this.state.hasCompletedInitialCalendarFetch;
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
        events: getCalendarEvents(state) || [],
        isSetupComplete: isSetupComplete(state),
        localRemoteControlId: getLocalRemoteControlId(state),
        lock: getCurrentLock(state)
    };
}

export default withRemoteControl(withCalendar(
    connect(mapStateToProps)(Home)));
