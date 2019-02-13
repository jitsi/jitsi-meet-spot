import PropTypes from 'prop-types';
import React from 'react';

import { logger } from 'common/logger';
import { Clock, ScheduledMeetings } from 'common/ui';

import { NavButton, SelfFillingNameEntry } from './../../components';

/**
 * Returns the React Element to display while the Spot instance is not in a
 * meeting. Displays controls for starting a meeting.
 *
 * @extends React.PureComponent
 */
export default class WaitingForCallView extends React.PureComponent {
    static propTypes = {
        events: PropTypes.array,
        onGoToMeeting: PropTypes.func
    }

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

        this._onSetCalendarActive = this._onSetCalendarActive.bind(this);
        this._onSetDialActive = this._onSetDialActive.bind(this);
        this._onSetInputActive = this._onSetInputActive.bind(this);
        this._onSetShareContentActive
            = this._onSetShareContentActive.bind(this);
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
                <div>
                    { this._getSubView() }
                </div>
                <div className = 'nav'>
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
                        active = { activeTab === 'share' }
                        iconName = 'screen_share'
                        label = 'Share content'
                        onClick = { this._onSetShareContentActive } />
                    <NavButton
                        active = { activeTab === 'dial' }
                        iconName = 'call'
                        label = 'Dial a number'
                        onClick = { this._onSetDialActive } />
                </div>
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

        logger.log(`waitingForCall showing ${activeTab}`);

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
        case 'share':
            return <div>in progress</div>;
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
     * Updates the state to display screen share.
     *
     * @private
     * @returns {void}
     */
    _onSetShareContentActive() {
        this.setState({ activeTab: 'share' });
    }
}
