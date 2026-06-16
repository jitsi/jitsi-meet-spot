import type { RootState } from 'common/app-state';
import {
    addNotification,
    getCalendarError,
    getCalendarEvents,
    getDisplayName,
    getProductName,
    getRemoteJoinCode,
    hasCalendarBeenFetched,
    isCalendarEnabled,
    isSetupComplete
} from 'common/app-state';
import { getPermanentPairingCode, isBackendEnabled } from 'common/backend';
import { COMMANDS, SERVICE_UPDATES } from 'common/remote-control';
import { Clock, FeedbackOpener, LoadingIcon, ScheduledMeetings } from 'common/ui';
import { getRandomMeetingName } from 'common/utils';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';


import { redirectToMeeting } from '../../app-state';

import {
    JoinInfo,
    SettingsButton,
    WiredScreenshareChangeListener as WiredScreenshareChangeListenerImpl
} from './../components';
import { withCalendar } from './../loaders';

// The withRouter/connect-wrapped export loses its own prop types, so cast it
// back to a component that accepts the props it actually consumes.
const WiredScreenshareChangeListener = WiredScreenshareChangeListenerImpl as React.ComponentType<{
    children?: React.ReactNode;
    onDeviceConnected?: (...args: any[]) => void;
    onDeviceDisconnected?: (...args: any[]) => void;
}>;

interface IHomeProps {
    calendarError?: any;
    calendarService?: any;
    enableAutoUpdate?: boolean;
    events?: any[];
    hasFetchedEvents?: boolean;
    isCalendarEnabled?: boolean;
    isSetupComplete?: boolean;
    onGoToMeetingCommand?: (data: any) => void;
    onStartScreenshareMeeting?: (...args: any[]) => void;
    onTimeWithinRangeUpdate?: (...args: any[]) => void;
    productName?: string;
    remoteControlServer?: any;
    remoteJoinCode?: string;
    spotRoomName?: string;
    t?: (key: string, options?: any) => string;
}

interface IHomeState {
    calendarError: any;
}

/**
 * A view of all known meetings in the calendar connected with Spot-TV.
 */
export class Home extends React.Component<IHomeProps, IHomeState> {
    static defaultProps = {
        remoteJoinCode: ''
    };

    /**
     * Initializes a new {@code Home} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IHomeProps) {
        super(props);

        this.state = {
            calendarError: null
        };

        this._onCommand = this._onCommand.bind(this);
    }

    /**
     * Registers listeners for updating the view's data and display.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Cleans up listeners for daemons and long-running updaters.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this.props.remoteControlServer.removeListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onCommand
        );
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     */
    render() {
        const {
            isSetupComplete: _isSetupComplete,
            spotRoomName
        } = this.props;

        return (
            <WiredScreenshareChangeListener
                onDeviceConnected = { this.props.onStartScreenshareMeeting }>
                <div className = 'spot-home'>
                    <Clock />
                    <div className = 'room-name'>
                        { spotRoomName && <div>{ spotRoomName }</div> }
                    </div>
                    <div className = 'calendar-content'>
                        { this._getCalendarEventsView() }
                    </div>
                    {
                        _isSetupComplete
                            && <div className = 'spot-home-footer'>
                                <JoinInfo showDomain = { _isSetupComplete } />
                            </div>
                    }
                </div>
                <div className = 'admin-toolbar'>
                    <SettingsButton />
                </div>
                <div className = 'home-feedback'>
                    <FeedbackOpener />
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

        if (!this.props.isCalendarEnabled) {
            return this._renderNoCalendar();
        }

        if (this.props.calendarError) {
            return this._renderError();
        }

        if (this.props.hasFetchedEvents) {
            return this.props.events?.length
                ? <ScheduledMeetings events = { this.props.events } />
                : this._renderNoEventsMessage();
        }

        return <LoadingIcon />;
    }

    /**
     * Listens for Spot-Remotes commanding this Spot-TV to enter a meeting.
     *
     * @param type - The type of the command being sent.
     * @param data - Additional data necessary to execute the command.
     * @private
     * @returns {void}
     */
    _onCommand(type: string, data: any) {
        switch (type) {
        case COMMANDS.GO_TO_MEETING: {
            this.props.onGoToMeetingCommand?.(data);
            break;
        }
        }
    }

    /**
     * Instantiates a React Element with a message stating calendar events could
     * not be fetched.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderError() {
        const { t } = this.props;

        return (
            <div className = 'no-events-message'>
                <div>{ t?.('calendar.errorGettingEvents') }</div>
                <div> { t?.('calendar.retrySync') }</div>
            </div>
        );
    }

    /**
     * Instantiates a React Element with a message without calendar data.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderNoCalendar() {
        const { productName, remoteJoinCode, t } = this.props;

        return (
            <div className = 'no-events-message'>
                <h1>{ t?.('welcome', { productName }) }</h1>
                {
                    remoteJoinCode
                        && (
                            <div className = 'setup-join-code'>
                                <JoinInfo />
                            </div>
                        )
                }
            </div>
        );
    }

    /**
     * Instantiates a React Element with a message stating there are no
     * scheduled meetings on the calendar associated with the Spot-TV.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderNoEventsMessage() {
        const { t } = this.props;

        return (
            <div className = 'no-events-message'>
                <div>{ t?.('calendar.noEvents') }</div>
                <div>{ t?.('calendar.inviteThisRoom') }</div>
            </div>
        );
    }

    /**
     * Instantiates a React Element with a message stating Spot-TV should have a
     * calendar connected.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderSetupMessage() {
        const { productName, remoteJoinCode, t } = this.props;

        return (
            <div className = 'no-events-message'>
                <h1>{ t?.('welcome', { productName }) }</h1>
                <div className = 'setup-instructions'>
                    <div>{ t?.('calendar.setupHeader') }</div>
                    <div>{ t?.('calendar.setupHow') }</div>

                </div>
                {
                    remoteJoinCode
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
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        calendarError: getCalendarError(state),
        enableAutoUpdate: isBackendEnabled(state)
            && Boolean(getPermanentPairingCode(state)),
        events: getCalendarEvents(state),
        hasFetchedEvents: hasCalendarBeenFetched(state),
        isCalendarEnabled: isCalendarEnabled(state),
        isSetupComplete: isSetupComplete(state),
        productName: getProductName(state),
        remoteJoinCode: getRemoteJoinCode(state),
        spotRoomName: getDisplayName(state)
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch: any) {
    return {
        onGoToMeetingCommand(data: any) {
            dispatch(redirectToMeeting(data.meetingName, {
                invites: data.invites,
                meetingDisplayName: data.meetingDisplayName,
                screenshare: data.startWithScreensharing === true,
                startWithVideoMuted: data.startWithVideoMuted === true
            }))
            .catch(() => {
                dispatch(addNotification(
                    'error',
                    'appEvents.invalidMeetingName'
                ));
            });
        },
        onStartScreenshareMeeting() {
            dispatch(redirectToMeeting(getRandomMeetingName(), { screenshare: true }));
        }
    };
}

export default withCalendar(
    connect(mapStateToProps, mapDispatchToProps)(
        withTranslation()(Home)
    )
);
