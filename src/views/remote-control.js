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
        dispatch: PropTypes.func,
        localRemoteControlId: PropTypes.string,
        match: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            events: [],
            view: ''
        };

        this._onCommand = this._onCommand.bind(this);
        this._onGoToMeeting = this._onGoToMeeting.bind(this);
        this._onPresence = this._onPresence.bind(this);
    }

    componentDidMount() {
        remoteControlService.init(this.props.dispatch)
            .then(() => {
                remoteControlService.addCommandListener(this._onCommand);

                remoteControlService.sendCommand(
                    this._getRemoteId(),
                    'requestCalendar',
                    { requester: this.props.localRemoteControlId }
                );

                remoteControlService.createMuc(this._getRemoteNode());

                remoteControlService.joinMuc();

                remoteControlService.addPresenceListener(this._onPresence);
            });
    }

    componentWillUnmount() {
        remoteControlService.removeCommandListener(this._onCommand);
    }

    render() {
        return (
            <View name = 'remoteControl'>
                <div className = { styles.container }>
                    { this._getView() }
                </div>
            </View>
        );
    }

    _getView() {
        switch (this.state.view) {
        case 'admin':
            return <div>currently in admin tools</div>;
        case 'calendar':
            return this._getWaitingForCallView();
        case 'meeting':
            return this._getInCallView();
        case 'setup':
            return <div>currently in setup</div>;
        default:
            return <div>loading</div>;
        }
    }

    _getRemoteNode() {
        return this._getRemoteId().split('@')[0];
    }

    _getRemoteId() {
        return decodeURIComponent(this.props.match.params.remoteId);
    }

    _getInCallView() {
        return (
            <RemoteControlMenu
                remoteId = { this._getRemoteId() }
                audioMuted = { this.state.audioMuted === 'true' }
                videoMuted = { this.state.videoMuted === 'true' } />
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

    _onPresence(data, from) {
        if (this._getRemoteId().indexOf(from) !== 0) {
            return;
        }

        switch (data.tagName) {
        case 'view':
            this.setState({ view: data.value });
            break;

        case 'audioMuted':
            this.setState({ audioMuted: data.value });
            break;

        case 'videoMuted':
            this.setState({ videoMuted: data.value });
            break;
        }
    }
}

function mapStateToProps(state) {
    return {
        localRemoteControlId: getLocalRemoteControlId(state)
    };
}
export default connect(mapStateToProps)(RemoteControl);
