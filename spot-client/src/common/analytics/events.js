export const eventStatusSuffixes = {
    FAIL: '-fail',
    PENDING: '-pending',
    SUCCESS: '-success'
};

export const feedbackEvents = {
    SKIP: 'spot-meeting-feedback-skip',
    SUBMIT: 'spot-meeting-feedback-submit'
};

export const inCallEvents = {
    AUDIO_MUTE: 'spot-audio-mute',
    HANG_UP: 'spot-hang-up',
    SCREENSHARE_STOP: 'spot-screenshare-stop',
    TILE_VIEW_TOGGLE: 'spot-toggled-tile-view',
    VIDEO_MUTE: 'spot-video-mute',
    WIRED_SCREENSHARE_START: 'spot-wired-screenshare',
    WIRELESS_SCREENSHARE_START: 'spot-wireless-screenshare'
};

export const joinCodeEvents = {
    SUBMIT: 'spot-join-code-submit',
    VALIDATE_FAIL: 'spot-join-code-validation-fail',
    VALIDATE_SUCCESS: 'spot-join-code-validation-success'
};

export const meetingJoinEvents = {
    AD_HOC: 'spot-ad-hoc-meeting-start',
    DIAL_OUT: 'spot-dial-out-start',
    SCHEDULED_MEETING_JOIN: 'spot-scheduled-meeting-join',
    WIRED_SCREENSHARE: 'spot-wired-screenshare-meeting-start',
    WIRELESS_SCREENSHARE: 'spot-wireless-screenshare-meeting-start'
};

export const shareModeEvents = {
    ENTER_SHARE_MODE: 'spot-enter-share-mode',
    EXIT_SHARE_MODE: 'spot-exit-share-mode'
};
