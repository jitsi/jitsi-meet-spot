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
        this._onMeetingLeave = this._onMeetingLeave.bind(this);

        this._meetingContainer = null;
        this._api = null;
    }

    componentDidMount() {
        const options = this._generateMeetingOptions();

        this._api = new JitsiMeetExternalAPI(MEETING_DOMAN, options);

        this._api.addListener('readyToClose', this._onMeetingLeave);
        this._api.executeCommand('displayName', this.props.displayName);
    }

    componentWillUnmount() {
        this._api.removeListener('readyToClose', this._onMeetingLeave);
        this._api.dispose();
    }

    render() {
        return (
            <div
                className = { styles.frame }
                ref = { this._setMeetingContainerRef } />
        );
    }

    _generateMeetingOptions() {
        return {
            roomName: this.props.meetingName,
            parentNode: this._meetingContainer
        };
    }

    _onMeetingLeave() {
        this.props.onMeetingLeave();
    }

    _setMeetingContainerRef(ref) {
        this._meetingContainer = ref;
    }
}
