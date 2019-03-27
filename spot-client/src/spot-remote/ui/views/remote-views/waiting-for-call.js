import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getInMeetingStatus } from 'common/app-state';
import { logger } from 'common/logger';
import { avUtils } from 'common/media';
import { Clock, ScheduledMeetings } from 'common/ui';
import {
    getRandomMeetingName,
    isWirelessScreenshareSupported
} from 'common/utils';

import {
    DialPad,
    NavButton,
    NavContainer,
    ScreensharePicker,
    SelfFillingNameEntry
} from './../../components';

/**
 * Returns the React Element to display while the Spot instance is not in a
 * meeting. Displays controls for starting a meeting.
 *
 * @extends React.PureComponent
 */
class WaitingForCallView extends React.Component {
    static propTypes = {
        events: PropTypes.array,
        onGoToMeeting: PropTypes.func,
        remoteControlService: PropTypes.object,
        wiredScreensharingEnabled: PropTypes.bool
    };

    /**
     * This field is used to keep tracks of the long, asynchronous process of joining the meeting
     * with the screensharing turned on.
     *
     * @type {Promise|undefined}
     */
    _goToMeetingPromise = undefined;

    /**
     * Initializes a new {@code App} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
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
     * Reset some fields when the component is being unmounted.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        this._goToMeetingPromise = undefined;
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { activeTab } = this.state;

        return (
            <div className = 'waiting-view'>
                <Clock />
                <div className = 'waiting-sub-view'>
                    { this._getSubView() }
                </div>
                <NavContainer>
                    <NavButton
                        active = { activeTab === 'calendar' }
                        iconName = 'calendar_today'
                        label = 'Calendar'
                        onClick = { this._onSetCalendarActive } />
                    <NavButton
                        active = { activeTab === 'input' }
                        iconName = 'videocam'
                        label = 'Meet Now'
                        onClick = { this._onSetInputActive }
                        qaId = 'meet-now' />
                    <NavButton
                        active = { activeTab === 'dial' }
                        iconName = 'call'
                        label = 'Dial a Number'
                        onClick = { this._onSetDialActive } />
                    <NavButton
                        active = { activeTab === 'share' }
                        iconName = 'screen_share'
                        label = 'Share Content'
                        onClick = { this._onSetScreenshareSelectActive }
                        qaId = 'share-content' />
                </NavContainer>
            </div>
        );
    }

    /**
     * Returns the feature to based on the currently selected view from the nav.
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
                <ScheduledMeetings
                    events = { this.props.events }
                    onMeetingClick = { this.props.onGoToMeeting } />
            );
        case 'input':
            return (
                <div className = 'meeting-name-entry-view'>
                    <SelfFillingNameEntry
                        onSubmit = { this.props.onGoToMeeting } />
                </div>
            );
        case 'dial':
            return (
                <div className = 'number-entry-view'>
                    <DialPad onSubmit = { this.props.onGoToMeeting } />
                </div>
            );
        case 'share':
            return (
                <div className = 'share-select-view'>
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
     * Automatically starts the wireless screensharing flow or displays the
     * screenshare start content if both wireless and wired screensharing are
     * supported.
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
     * Updates the state to display screen share.
     *
     * @param {boolean} wireless - True for wireless or false for wired.
     * @private
     * @returns {void}
     */
    _onJoinWithScreensharing(wireless) {
        // This prevents from triggering the action twice
        if (this._goToMeetingPromise) {
            return;
        }

        const goToMeetingPromise = this.props.onGoToMeeting(
            getRandomMeetingName(),
            {
                startWithScreensharing: wireless ? 'wireless' : 'wired'
            }
        )
        .catch(error => {
            const events = avUtils.getTrackErrorEvents();

            if (error.name === events.CHROME_EXTENSION_USER_CANCELED) {
                logger.log('onGoToMeeting with screensharing canceled by the user');
            } else {
                logger.error('onGoToMeeting with screensharing rejected', { error });
            }
        })
        .then(() => {
            this._goToMeetingPromise = undefined;
        });

        this._goToMeetingPromise = goToMeetingPromise;
    }
}

/**
 * Selects parts of the Redux state to pass in with the props of {@code WaitingForCallView}.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    return {
        ...getInMeetingStatus(state)
    };
}

export default connect(mapStateToProps)(WaitingForCallView);
