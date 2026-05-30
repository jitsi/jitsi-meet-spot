import { logger } from 'common/logger';
import { SERVICE_UPDATES } from 'common/remote-control';
import bindAll from 'lodash.bindall';
import React from 'react';
import { MESSAGE_TYPES, nativeController } from 'spot-tv/native-functions';

import { ApiHealthCheck } from './ApiHealthCheck';

interface IProps {
    displayName?: string;
    dtmfThrottleRate?: number;
    invites?: any[];
    jitsiAppName?: string;
    jwt?: string;
    maxDesktopSharingFramerate?: number;
    meetingDisplayName?: string;
    meetingJoinTimeout?: number;
    meetingUrl?: string;
    minDesktopSharingFramerate?: number;
    onMeetingLeave?: (...args: any[]) => void;
    onMeetingStart?: (...args: any[]) => void;
    preferredCamera?: string;
    preferredMic?: string;
    preferredResolution?: string;
    preferredSpeaker?: string;
    remoteControlServer?: any;
    screenshareDevice?: string;
    startWithScreenshare?: boolean;
    startWithVideoMuted?: boolean;
    updateSpotTvState?: (...args: any[]) => void;
}

/**
 * Common code shared between vendor specific meeting frame components.
 */
export default class AbstractMeetingFrame<P extends IProps = IProps, S = Record<string, never>>
    extends React.Component<P, S> {
    /**
     * The API health checker instance.
     *
     * @private
     */
    _apiHealthChecks: ApiHealthCheck | undefined;

    /**
     * The max number of participants that was at some point in the meeting. The value should be updated by
     * the vendor specific meeting frame class.
     *
     * @protected
     */
    _maxParticipantCount: number;

    /**
     * A timestamp indicates when the meeting was joined.
     *
     * @protected
     */
    _meetingStartTime: number | undefined;

    meetingType: any;

    /**
     * Creates new instance.
     *
     * @param props - The read-only properties with which the new instance is to be initialized.
     * @param meetingType - A constant for the meeting type reported to analytics.
     */
    constructor(props: P, meetingType: any) {
        super(props);

        this._apiHealthChecks = undefined;

        this._maxParticipantCount = 1;

        this._meetingStartTime = undefined;

        this.meetingType = meetingType;

        bindAll(this, [
            '_onApiHealthCheckError',
            '_onMeetingCommandReceived',
            '_onMeetingJoined',
            '_onMeetingLeave'
        ]);
    }

    /**
     * Enables and starts the API health checks.
     *
     * @param healthCheckFunction - A function which returns a promise which is supposed to check the API by
     * doing a ping or other short operation which would confirm that the API is responsive. The health check will fail
     * if the promise will not resolve withing the time limit or if rejected. Check {@link ApiHealthCheck} for more
     * details.
     * @protected
     * @returns {void}
     */
    _enableApiHealthChecks(healthCheckFunction: () => Promise<any>): void {
        this._apiHealthChecks = new ApiHealthCheck(
            healthCheckFunction,
            this._onApiHealthCheckError
        );
        this._apiHealthChecks.start();
    }

    /**
     * Initialize the frame.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this.props.remoteControlServer?.addListener(
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
        this._apiHealthChecks?.stop();

        this.props.remoteControlServer?.removeListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onMeetingCommandReceived
        );

        nativeController.removeMessageListener(
            MESSAGE_TYPES.MEETING_COMMAND,
            this._onMeetingCommandReceived
        );
    }

    /**
     * Callback invoked when the iFrame is not responsive.
     *
     * @param reason - The detected reason for the failed health check.
     * @private
     * @returns {void}
     */
    _onApiHealthCheckError(reason: string): void {
        logger.error('api health check failed', { reason });

        // TODO: monitor logs and figure out why we get this failure when things are ok (well, are they?!).
        // this._onMeetingLeave({
        //    errorCode: reason,
        //    error: 'appEvents.meetingConnectionLost'
        // });
    }

    /**
     * Callback invoked when a Spot-Remote is requesting a change to the
     * meeting.
     *
     * @param type - The constant representing the command.
     * @param data - Additional information about how to perform the
     * command.
     * @private
     * @returns {void}
     */
    _onMeetingCommandReceived(type: any, data: any): void {
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
     * Handles a meeting command. Implemented by subclasses.
     *
     * @param command - The constant representing the command.
     * @param args - Additional information about how to perform the command.
     * @protected
     * @returns {void}
     */
    _onMeetingCommand(_command: any, _args: any): void {
        // To be implemented by subclasses.
    }

    /**
     * The method should be called be implementing subclasses when the meeting has been successfully joined.
     *
     * @protected
     * @returns {void}
     */
    _onMeetingJoined(_event?: any): void {
        logger.log('meeting joined');

        this._meetingStartTime = Date.now();

        this.props.updateSpotTvState?.({
            inMeeting: this.props.meetingUrl,
            meetingDisplayName: this.props.meetingDisplayName,
            needPassword: false,
            waitingForMeetingStart: false
        });

        this.props.onMeetingStart?.();
    }

    /**
     * Method called when the meeting is about to be left and the app is supposed to navigate to another path.
     *
     * @param leaveEvent - The leave event.
     * @protected
     * @returns {void}
     */
    _onMeetingLeave(leaveEvent: { error?: any; errorCode?: any; [key: string]: any; } = { }): void {
        const meetingSummary = {
            duration: this._meetingStartTime ? (Date.now() - this._meetingStartTime) / 1000 : 0,
            error: leaveEvent.error,
            errorCode: leaveEvent.errorCode,
            participantCount: this._maxParticipantCount,
            type: this.meetingType,
            url: this.props.meetingUrl
        };

        this.props.onMeetingLeave?.({
            ...leaveEvent,
            meetingSummary
        });
    }
}
