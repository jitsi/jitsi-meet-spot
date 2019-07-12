export const eventStatusSuffixes = {
    FAIL: '-fail',
    PENDING: '-pending',
    SUCCESS: '-success'
};

export const feedbackEvents = {
    SKIP: 'feedback-skip',
    SUBMIT: 'feedback-submit'
};

export const inCallEvents = {
    AUDIO_MUTE: 'audio-mute',
    HANG_UP: 'hang-up',
    SCREENSHARE_STOP: 'screenshare-stop',
    TILE_VIEW_TOGGLE: 'toggled-tile-view',
    VIDEO_MUTE: 'video-mute',
    WIRED_SCREENSHARE_START: 'wired-screenshare',
    WIRELESS_SCREENSHARE_START: 'wireless-screenshare'
};

export const joinCodeEvents = {
    SUBMIT: 'join-code-submit',
    VALIDATE_FAIL: 'join-code-validation-fail',
    VALIDATE_SUCCESS: 'join-code-validation-success'
};

export const meetingJoinEvents = {
    AD_HOC: 'ad-hoc-meeting-start',
    DIAL_OUT: 'dial-out-start',
    SCHEDULED_MEETING_JOIN: 'scheduled-meeting-join',
    WIRED_SCREENSHARE: 'wired-screenshare-meeting-start',
    WIRELESS_SCREENSHARE: 'wireless-screenshare-meeting-start'
};

export const shareModeEvents = {
    ENTER_SHARE_MODE: 'enter-share-mode',
    EXIT_SHARE_MODE: 'exit-share-mode'
};
