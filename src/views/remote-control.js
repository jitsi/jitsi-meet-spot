import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Button } from 'features/button';
import { MeetingNameEntry } from 'features/meeting-name-entry';
import { ScheduledMeetings } from 'features/scheduled-meetings';
import { remoteControlService } from 'remote-control';
import { getLocalRemoteControlId } from 'reducers';
import View from './view';
import styles from './view.css';

// Command names are from the the jitsi meet api itself.
const COMMANDS = {
    HANG_UP: 'hangup',
    TOGGLE_AUDIO_MUTE: 'toggleAudio',
    TOGGLE_SCREENSHARE: 'toggleShareScreen',
    TOGGLE_VIDEO_MUTE: 'toggleVideo'
};

export class RemoteControlDebug extends React.Component {
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
        this._onHangUp = this._onHangUp.bind(this);
        this._onToggleAudioMute = this._onToggleAudioMute.bind(this);
        this._onToggleVideoMute = this._onToggleVideoMute.bind(this);
        this._onToggleScreenshare = this._onToggleScreenshare.bind(this);
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
            <View>
                <div className = { styles.container }>
                    <MeetingNameEntry onSubmit = { this._onGoToMeeting } />
                    <div>
                        <Button onClick = { this._onToggleAudioMute }>
                            Toggle Audio Mute
                        </Button>
                    </div>
                    <div>
                        <Button onClick = { this._onHangUp }>
                            Hangup
                        </Button>
                    </div>
                    <div>
                        <Button onClick = { this._onToggleVideoMute }>
                            Toggle Video Mute
                        </Button>
                    </div>
                    <div>
                        <Button onClick = { this._onToggleScreenshare }>
                            Toggle Screenshare
                        </Button>
                    </div>
                    <ScheduledMeetings
                        events = { this.state.events }
                        onMeetingClick = { this._onGoToMeeting } />
                </div>
            </View>
        );
    }

    _getRemoteId() {
        return decodeURIComponent(this.props.match.params.remoteId);
    }

    _onCommand(command, options) {
        console.log('got it', command, options);
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

    _onHangUp() {
        remoteControlService.sendCommand(this._getRemoteId(), COMMANDS.HANG_UP);
    }

    _onToggleAudioMute() {
        remoteControlService.sendCommand(
            this._getRemoteId(), COMMANDS.TOGGLE_AUDIO_MUTE);
    }

    _onToggleVideoMute() {
        remoteControlService.sendCommand(
            this._getRemoteId(), COMMANDS.TOGGLE_VIDEO_MUTE);
    }

    _onToggleScreenshare() {
        remoteControlService.sendCommand(
            this._getRemoteId(), COMMANDS.TOGGLE_SCREENSHARE);
    }
}

function mapStateToProps(state) {
    return {
        localRemoteControlId: getLocalRemoteControlId(state)
    };
}
export default connect(mapStateToProps)(RemoteControlDebug);
