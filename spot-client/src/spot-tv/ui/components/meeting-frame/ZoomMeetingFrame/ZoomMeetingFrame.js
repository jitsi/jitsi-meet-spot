import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getZoomConfiguration, setSpotTVState } from 'common/app-state';
import { logger } from 'common/logger';
import { COMMANDS, SERVICE_UPDATES } from 'common/remote-control';
import { parseMeetingUrl } from 'common/utils';
import { errorCodes, events } from 'common/zoom';

import AbstractMeetingFrame from '../AbstractMeetingFrame';

import ZoomIframeManager from './ZoomIframeManager';

/**
 * The iFrame used to to display a Zoom meeting.
 *
 * @extends React.Component
 */
export class ZoomMeetingFrame extends AbstractMeetingFrame {
    static propTypes = {
        ...AbstractMeetingFrame.propTypes,
        apiKey: PropTypes.string,
        meetingSignService: PropTypes.string
    };

    /**
     * Instantiates a new instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this._zoomIframeManager = null;
        this._joinRetryTimeout = null;

        this._rootRef = React.createRef();

        this._onMeetingCommand = this._onMeetingCommand.bind(this);
        this._onMeetingUpdateReceived = this._onMeetingUpdateReceived.bind(this);
    }

    /**
     * Initialize the Zoom iFrame and its command plane.
     *
     * @inheritdoc
     */
    componentDidMount() {
        this._zoomIframeManager = new ZoomIframeManager({
            apiKey: this.props.apiKey,
            iframeTarget: this._rootRef.current,
            meetingSignService: this.props.meetingSignService,
            onMeetingUpdateReceived: this._onMeetingUpdateReceived
        });

        this.props.remoteControlServer.addListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onMeetingCommand
        );

        this._zoomIframeManager.load();
    }

    /**
     * Cleans up Zoom meeting state.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        super.componentWillUnmount();

        this._zoomIframeManager.destroy();

        clearTimeout(this._joinRetryTimeout);

        this.props.remoteControlServer.removeListener(
            SERVICE_UPDATES.CLIENT_MESSAGE_RECEIVED,
            this._onMeetingCommand
        );

        this.props.updateSpotTvState({
            audioMuted: false,
            inMeeting: '',
            kicked: false,
            meetingDisplayName: '',
            needPassword: false,
            videoMuted: false,
            waitingForMeetingStart: false
        });
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <div
                className = 'meeting-frame'
                ref = { this._rootRef } />
        );
    }

    /**
     * Sets a timeout to attempt to join the Zoom meeting.
     *
     * @private
     * @returns {void}
     */
    _enqueueJoinRetry() {
        clearTimeout(this._joinRetryTimeout);

        this._joinRetryTimeout = setTimeout(() => {
            this._goToMeeting();
        }, 15000);
    }

    /**
     * Attempt to join the Zoom meeting.
     *
     * @private
     * @returns {void}
     */
    _goToMeeting() {
        this._zoomIframeManager.goToMeeting(
            parseMeetingUrl(this.props.meetingUrl).meetingName,
            '', // first try an empty password
            this.props.displayName
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
    _onMeetingCommand(type, data) {
        logger.log('MeetingFrame handling remote command', {
            data,
            type
        });

        switch (type) {
        case COMMANDS.HANG_UP: {
            if (data.skipFeedback) {
                this._onMeetingLeave();

                return;
            }

            this._zoomIframeManager.hangUp();

            break;
        }
        case COMMANDS.SET_AUDIO_MUTE:
            this._zoomIframeManager.setAudioMute(data.mute);
            break;

        case COMMANDS.SET_VIDEO_MUTE:
            this._zoomIframeManager.setVideoMute(data.mute);
            break;

        case COMMANDS.SUBMIT_PASSWORD:
            this.props.updateSpotTvState({ needPassword: false });
            this._zoomIframeManager.submitPassword(data);

            break;
        }
    }

    /**
     * Callback invoked when the Zoom meeting has an update of its meeting state.
     *
     * @param {string} type - The constant representing the update.
     * @param {Object} data - Details explaining the update.
     * @private
     * @returns {void}
     */
    _onMeetingUpdateReceived(type, data) {
        switch (type) {
        case events.AUDIO_MUTE_UPDATED: {
            logger.log('audio mute changed', {
                to: data.muted
            });

            this.props.updateSpotTvState({ audioMuted: data.muted });

            break;
        }

        case events.MEETING_ENDED: {
            this._onMeetingLeave();
            break;
        }

        case events.MEETING_JOIN_FAILED: {
            // [1]: https://marketplace.zoom.us/docs/sdk/native-sdks/web/error-codes
            const zoomErrorCode = data?.error?.code;

            if (zoomErrorCode === errorCodes.FAIL || zoomErrorCode === errorCodes.ERROR_NOT_EXIST) {
                // The error code FAIL is defined as a general failure in [1], but according to the internets[2] and
                // local testing it can happen is other cases as well including when trying to join invalid meeting ID.
                // [2]: https://devforum.zoom.us/t/joining-fail-with-error-code-1/6417
                logger.log('Zoom meeting does not exist');
                this._onMeetingLeave({
                    errorCode: 'meeting-not-found',
                    error: 'appEvents.meetingDoesNotExist'
                });
            } else if (zoomErrorCode === errorCodes.MEETING_NOT_START) {
                logger.log('Zoom meeting has not started');

                this.props.updateSpotTvState({ waitingForMeetingStart: true });
                this._enqueueJoinRetry();
            } else if (zoomErrorCode === errorCodes.WRONG_MEETING_PASSWORD) {
                logger.log('password required');

                this.props.updateSpotTvState({
                    needPassword: true,
                    waitingForMeetingStart: false
                });
            } else {
                logger.warn('Failed to join zoom meeting', { zoomErrorCode });
                this._onMeetingLeave({
                    errorCode: 'failed-to-join',
                    error: 'appEvents.meetingJoinFailed'
                });
            }
            break;
        }

        case events.MEETING_JOIN_SUCCEEDED: {
            this._onMeetingJoined();

            this._enableApiHealthChecks(() => this._zoomIframeManager.ping());

            break;
        }

        case events.READY: {
            this._goToMeeting();

            break;
        }

        case events.VIDEO_MUTE_UPDATED: {
            logger.log('Video mute changed', {
                to: data.muted
            });

            this.props.updateSpotTvState({ videoMuted: data.muted });

            break;
        }
        }
    }
}

/**
 * Selects parts of the Redux state to pass in with props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {Object}
 */
function mapStateToProps(state) {
    const { API_KEY, MEETING_SIGN_SERVICE_URL } = getZoomConfiguration(state);

    return {
        apiKey: API_KEY,
        meetingSignService: MEETING_SIGN_SERVICE_URL
    };
}

/**
 * Creates actions which can update Redux state.
 *
 * @param {Function} dispatch - The Redux dispatch function to update state.
 * @private
 * @returns {Object}
 */
function mapDispatchToProps(dispatch) {
    return {
        updateSpotTvState(newState) {
            dispatch(setSpotTVState(newState));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ZoomMeetingFrame);
