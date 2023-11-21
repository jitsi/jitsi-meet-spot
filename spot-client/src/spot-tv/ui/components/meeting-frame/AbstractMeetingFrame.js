import { logger } from 'common/logger';
import { SERVICE_UPDATES } from 'common/remote-control';
import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import { MESSAGE_TYPES, nativeController } from 'spot-tv/native-functions';


/**
 * Common code shared between vendor specific meeting frame components.
 */
export default class AbstractMeetingFrame extends React.Component {
    static propTypes = {
        avatarUrl: PropTypes.string,
        displayName: PropTypes.string,
        dtmfThrottleRate: PropTypes.number,
        invites: PropTypes.array,
        jitsiAppName: PropTypes.string,
        jwt: PropTypes.string,
        maxDesktopSharingFramerate: PropTypes.number,
        meetingDisplayName: PropTypes.string,
        meetingJoinTimeout: PropTypes.number,
        meetingUrl: PropTypes.string,
        minDesktopSharingFramerate: PropTypes.number,
        onMeetingLeave: PropTypes.func,
        onMeetingStart: PropTypes.func,
        preferredCamera: PropTypes.string,
        preferredMic: PropTypes.string,
        preferredResolution: PropTypes.string,
        preferredSpeaker: PropTypes.string,
        remoteControlServer: PropTypes.object,
        screenshareDevice: PropTypes.string,
        startWithScreenshare: PropTypes.bool,
        startWithVideoMuted: PropTypes.bool,
        updateSpotTvState: PropTypes.func
    };

    /**
     * Creates new instance.
     *
     * @param {Object} props - The read-only properties with which the new instance is to be initialized.
     * @param {MeetingType} meetingType - A constant for the meeting type reported to analytics.
     */
    constructor(props, meetingType) {
        super(props);

        /**
         * The max number of participants that was at some point in the meeting. The value should be updated by
         * the vendor specific meeting frame class.
         *
         * @type {number}
         * @protected
         */
        this._maxParticipantCount = 1;

        /**
         * A timestamp indicates when the meeting was joined.
         *
         * @type {number|undefined}
         * @protected
         */
        this._meetingStartTime = undefined;

        this.meetingType = meetingType;

        bindAll(this, [
            '_onMeetingCommandReceived',
            '_onMeetingJoined',
            '_onMeetingLeave'
        ]);
    }

    /**
     * Initialize the frame.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onMeetingCommandReceived
        );

        nativeController.addMessageListener(
            MESSAGE_TYPES.MEETING_COMMAND,
            this._onMeetingCommandReceived
        );
    }

    /**
     * Cleanup.
     *
     * @returns {void}
     */
    componentWillUnmount() {
        this.props.remoteControlServer.removeListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onMeetingCommandReceived
        );

        nativeController.removeMessageListener(
            MESSAGE_TYPES.MEETING_COMMAND,
            this._onMeetingCommandReceived
        );
    }

    /**
     * Callback invoked when a Spot-Remote is requesting a change to the
     * meeting.
     *
     * @param {string} type - The constant representing the command.
     * @param {Object} data - Additional information about how to perform the
     * command.
     * @private
     * @returns {void}
     */
    _onMeetingCommandReceived(type, data) {
        logger.log('MeetingFrame handling remote command', {
            data,
            type
        });

        if (typeof type === 'object') {
            // This is a native controller command that has type and data wrapped
            // into an object, so we need to deconstruct it.
            const { command, args } = type;

            this._onMeetingCommand(command, args);
        } else {
            this._onMeetingCommand(type, data);
        }
    }

    /**
     * The method should be called be implementing subclasses when the meeting has been successfully joined.
     *
     * @protected
     * @returns {void}
     */
    _onMeetingJoined() {
        logger.log('meeting joined');

        this._meetingStartTime = Date.now();

        this.props.updateSpotTvState({
            inMeeting: this.props.meetingUrl,
            meetingDisplayName: this.props.meetingDisplayName,
            needPassword: false,
            waitingForMeetingStart: false
        });

        this.props.onMeetingStart();
    }

    /**
     * Method called when the meeting is about to be left and the app is supposed to navigate to another path.
     *
     * @param {Object} leaveEvent - The leave event.
     * @protected
     * @returns {void}
     */
    _onMeetingLeave(leaveEvent = { }) {
        const meetingSummary = {
            duration: this._meetingStartTime ? (Date.now() - this._meetingStartTime) / 1000 : 0,
            error: leaveEvent.error,
            errorCode: leaveEvent.errorCode,
            participantCount: this._maxParticipantCount,
            type: this.meetingType,
            url: this.props.meetingUrl
        };

        this.props.onMeetingLeave({
            ...leaveEvent,
            meetingSummary
        });
    }
}
