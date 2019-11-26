import PropTypes from 'prop-types';

export default {
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
    preferredSpeaker: PropTypes.string,
    remoteControlServer: PropTypes.object,
    screenshareDevice: PropTypes.string,
    startWithScreenshare: PropTypes.bool,
    startWithVideoMuted: PropTypes.bool,
    updateSpotTvState: PropTypes.func
};
