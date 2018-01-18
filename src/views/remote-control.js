import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { MeetingNameEntry } from 'features/meeting-name-entry';
import { RemoteControlMenu } from 'features/remote-control-menu';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import { remoteControlService } from 'remote-control';
import { getLocalRemoteControlId } from 'reducers';
import View from './view';
import styles from './view.css';

export class RemoteControl extends React.Component {
    static propTypes = {
        localRemoteControlId: PropTypes.string,
        match: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            events: []
        };

        this._onCommand = this._onCommand.bind(this);
        this._onGoToMeeting = this._onGoToMeeting.bind(this);
    }

    componentDidMount() {
        remoteControlService.addCommandListener(this._onCommand);

        // TODO: waiting for xmpp to connect should be part of loading
        setTimeout(() => {
            remoteControlService.sendCommand(
                this._getRemoteId(),
                'requestCalendar',
                { requester: this.props.localRemoteControlId }
            );
        }, 3000);
    }

    componentWillUnmount() {
        remoteControlService.removeCommandListener(this._onCommand);
    }

    render() {
        return (
            <View name = 'remoteControl'>
                <div className = { styles.container }>
                    { this._getInCallView() }
                    { this._getWaitingForCallView() }
                </div>
            </View>
        );
    }

    _getRemoteId() {
        return decodeURIComponent(this.props.match.params.remoteId);
    }

    _getInCallView() {
        return (
            <RemoteControlMenu
                remoteId = { this._getRemoteId() } />
        );
    }

    _getWaitingForCallView() {
        return (
            <div>
                <MeetingNameEntry onSubmit = { this._onGoToMeeting } />
                <ScheduledMeetings
                    events = { this.state.events }
                    onMeetingClick = { this._onGoToMeeting } />
            </div>
        );
    }

    _onCommand(command, options) {
        if (command === 'calendarData') {
            this.setState({
                events: options.events
            });
        }
    }

    _onGoToMeeting(meetingName) {
        remoteControlService.sendCommand(
            this._getRemoteId(), 'goToMeeting', { meetingName });
    }
}

function mapStateToProps(state) {
    return {
        localRemoteControlId: getLocalRemoteControlId(state)
    };
}
export default connect(mapStateToProps)(RemoteControl);
