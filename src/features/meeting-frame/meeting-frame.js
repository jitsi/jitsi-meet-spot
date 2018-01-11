/* global JitsiMeetExternalAPI */

import PropTypes from 'prop-types';
import React from 'react';

import styles from './meeting-frame.css';

const MEETING_DOMAN = 'meet.jit.si';

export default class MeetingFrame extends React.Component {
    static propTypes = {
        displayName: PropTypes.string,
        meetingName: PropTypes.string,
        onMeetingLeave: PropTypes.func
    };

    constructor(props) {
        super(props);

        this._setMeetingContainerRef = this._setMeetingContainerRef.bind(this);

        this._jitsiApi = null;
        this._meetingContainer = null;
    }

    componentDidMount() {
        this._jitsiApi = new JitsiMeetExternalAPI(MEETING_DOMAN, {
            roomName: this.props.meetingName,
            parentNode: this._meetingContainer
        });

        this._jitsiApi.addListener('readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.executeCommand('displayName', this.props.displayName);
    }

    componentWillUnmount() {
        this._jitsiApi.removeListener(
            'readyToClose', this.props.onMeetingLeave);
        this._jitsiApi.dispose();
    }

    render() {
        return (
            <div
                className = { styles.frame }
                ref = { this._setMeetingContainerRef } />
        );
    }

    _setMeetingContainerRef(ref) {
        this._meetingContainer = ref;
    }
}
