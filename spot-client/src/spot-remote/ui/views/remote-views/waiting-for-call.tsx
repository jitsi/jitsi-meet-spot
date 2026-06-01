
import type { RootState } from 'common/app-state';
import {
    dialOut,
    getConfiguredMeetingDomain,
    getInMeetingStatus,
    getSpotTVTenant,
    joinAdHocMeeting,
    joinScheduledMeeting,
    joinWithScreensharing
} from 'common/app-state';
import { isWirelessScreenshareSupported } from 'common/detection';
import { ArrowRightAlt, Call, Event, ScreenShare } from 'common/icons';
import { logger } from 'common/logger';
import {
    Clock,
    RoomName,
    ScheduledMeetings
} from 'common/ui';
import { getRandomMeetingName } from 'common/utils';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    DialPad,
    NavItem,
    NavList,
    ScreensharePicker,
    SelfFillingNameEntry
} from './../../components';

type ActiveTab = 'calendar' | 'input' | 'dial' | 'share';

interface IProps {
    _dispatchJoinWithScreensharing?: (meetingName: string, screensharingType: string) => void;
    _onDialOut?: (meetingName: string, phoneNumber: string) => void;
    _onJoinAdHocMeeting?: (meetingName: string) => void;
    _onJoinScheduledMeeting?: (meetingName: string, meetingDisplayName?: string) => void;
    domain?: string;
    events?: any[];
    t?: (key: string) => string;
    tenant?: string;
    wiredScreensharingEnabled?: boolean;
}

interface IState {
    activeTab: ActiveTab;
}

/**
 * Returns the React Element to display while the Spot-TV instance is not in a
 * meeting. Displays controls for starting a meeting.
 */
class WaitingForCallView extends React.Component<IProps, IState> {
    _onJoinWithWiredScreensharing: () => void;
    _onJoinWithWirelessScreensharing: () => void;

    /**
     * Initializes a new {@code WaitingForCallView} instance.
     *
     * @param props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: IProps) {
        super(props);

        this.state = {
            activeTab: 'calendar'
        };

        this._onJoinWithWiredScreensharing
            = this._onJoinWithScreensharing.bind(this, /* wired */ false);
        this._onJoinWithWirelessScreensharing
            = this._onJoinWithScreensharing.bind(this, /* wireless */ true);
        this._onSetCalendarActive = this._onSetCalendarActive.bind(this);
        this._onSetDialActive = this._onSetDialActive.bind(this);
        this._onSetInputActive = this._onSetInputActive.bind(this);
        this._onSetScreenshareSelectActive
            = this._onSetScreenshareSelectActive.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { t } = this.props;
        const { activeTab } = this.state;

        return (
            <div
                className = 'waiting-view waiting-for-call-view'
                data-qa-id = 'waiting-for-call-view'>
                <div className = 'view-header'>
                    <RoomName />
                </div>
                <div className = 'waiting-sub-view'>
                    { this._getSubView() }
                </div>
                <NavList>
                    <NavItem
                        active = { activeTab === 'calendar' }
                        label = { t?.('calendar.calendar') }
                        onClick = { this._onSetCalendarActive }>
                        <Event />
                    </NavItem>
                    <NavItem
                        active = { activeTab === 'input' }
                        id = 'meet-now'
                        label = { t?.('adhoc.meetNow') }
                        onClick = { this._onSetInputActive }
                        qaId = 'meet-now'>
                        <ArrowRightAlt />
                    </NavItem>
                    <NavItem
                        active = { activeTab === 'dial' }
                        label = { t?.('dial.dial') }
                        onClick = { this._onSetDialActive }>
                        <Call />
                    </NavItem>
                    <NavItem
                        active = { activeTab === 'share' }
                        id = 'share-content'
                        label = { t?.('commands.share') }
                        onClick = { this._onSetScreenshareSelectActive }
                        qaId = 'share-content'>
                        <ScreenShare />
                    </NavItem>
                </NavList>
            </div>
        );
    }

    /**
     * Returns the UI to display to based on the currently selected view from
     * the nav.
     *
     * @private
     * @returns {ReactComponent}
     */
    _getSubView() {
        const { activeTab } = this.state;

        logger.log('waitingForCall view updating', { activeTab });

        switch (activeTab) {
        case 'calendar':
            return (
                <div className = 'remote-calendar-view'>
                    <Clock />
                    <ScheduledMeetings
                        events = { this.props.events }
                        onMeetingClick = { this.props._onJoinScheduledMeeting } />
                </div>
            );
        case 'input':
            return (
                <div className = 'meeting-name-entry-view'>
                    <SelfFillingNameEntry
                        domain = { this.props.domain }
                        onSubmit = { this.props._onJoinAdHocMeeting }
                        tenant = { this.props.tenant } />
                </div>
            );
        case 'dial':
            return (
                <div className = 'number-entry-view'>
                    <DialPad onSubmit = { this.props._onDialOut ?? (() => { /* noop */ }) } />
                </div>
            );
        case 'share':
            return (
                <div className = 'share-select-view modal-content'>
                    <ScreensharePicker
                        onStartWiredScreenshare
                            = { this._onJoinWithWiredScreensharing }
                        onStartWirelessScreenshare
                            = { this._onJoinWithWirelessScreensharing }
                        wiredScreenshareEnabled
                            = { this.props.wiredScreensharingEnabled }
                        wirelessScreenshareEnabled
                            = { isWirelessScreenshareSupported() } />
                </div>
            );
        }
    }

    /**
     * Updates the state to display the calendar view.
     *
     * @private
     * @returns {void}
     */
    _onSetCalendarActive() {
        this.setState({ activeTab: 'calendar' });
    }

    /**
     * Updates the state to display the dial in view.
     *
     * @private
     * @returns {void}
     */
    _onSetDialActive() {
        this.setState({ activeTab: 'dial' });
    }

    /**
     * Updates the state to display meeting name input.
     *
     * @private
     * @returns {void}
     */
    _onSetInputActive() {
        this.setState({ activeTab: 'input' });
    }

    /**
     * Automatically starts the wireless screensharing flow or, f both wireless
     * and wired screensharing are supported, displays the screenshare start
     * modal.
     *
     * @private
     * @returns {void}
     */
    _onSetScreenshareSelectActive() {
        // If only wireless sceensharing is available then start the wireless
        // screensharing flow.
        if (isWirelessScreenshareSupported()
            && !this.props.wiredScreensharingEnabled) {
            this._onJoinWithScreensharing(true);

            return;
        }

        // Otherwise defer all screensharing choices to the modal.
        this.setState({ activeTab: 'share' });
    }

    /**
     * Updates the state to display screenshare.
     *
     * @param wireless - True for wireless or false for wired.
     * @private
     * @returns {void}
     */
    _onJoinWithScreensharing(wireless: boolean) {
        this.props._dispatchJoinWithScreensharing?.(
            getRandomMeetingName(),
            wireless ? 'wireless' : 'wired'
        );
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code WaitingForCallView}.
 *
 * @param state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state: RootState) {
    return {
        ...getInMeetingStatus(state),
        domain: getConfiguredMeetingDomain(state),
        tenant: getSpotTVTenant(state)
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
        _dispatchJoinWithScreensharing(meetingName: string, screensharingType: string) {
            dispatch(joinWithScreensharing(meetingName, screensharingType));
        },
        _onDialOut(meetingName: string, phoneNumber: string) {
            if (meetingName && phoneNumber) {
                dispatch(dialOut(meetingName, phoneNumber));
            } else {
                logger.log('Skipped dial-out', {
                    meetingName,
                    phoneNumber
                });
            }
        },
        _onJoinScheduledMeeting(meetingName: string, meetingDisplayName?: string) {
            dispatch(joinScheduledMeeting(meetingName, meetingDisplayName));
        },
        _onJoinAdHocMeeting(meetingName: string) {
            dispatch(joinAdHocMeeting(meetingName));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(
    withTranslation()(WaitingForCallView)
);
