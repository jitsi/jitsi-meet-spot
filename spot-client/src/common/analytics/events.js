export const feedbackEvents = {
    SKIP: 'feedback-skip',
    SUBMIT: 'feedback-submit'
};

export const inCallEvents = {
    AUDIO_MUTE: 'audio-mute',
    HANG_UP: 'hang-up',
    SHARE_CONTENT: 'share-content',
    SCREENSHARE_STOP: 'screenshare-stop',
    VIDEO_MUTE: 'video-mute',
    WIRED_SCREENSHARE_START: 'wired-screenshare',
    WIRELESS_SCREENSHARE_START: 'wireless-screenshare',
    WIRELESS_SCREENSHARE_START_NO_WIRED_AVAILABLE: 'wireless-only-screenshare'
};

export const meetingJoinEvents = {
    AD_HOC: 'ad-hoc-meeting-start',
    DIAL_OUT: 'dial-out-start',
    SCHEDULED_MEETING_JOIN: 'scheduled-meeting-join',
    WIRED_SCREENSHARE: 'wired-screenshare-meeting-start',
    WIRELESS_SCREENSHARE: 'wireless-screenshare-meeting-start'
};
