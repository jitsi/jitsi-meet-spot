/**
 * An enumeration of supported commands Spot can processes. All values are from
 * events triggered by the jitsi meet iframe api.
 */
export const COMMANDS = {

    /**
     * Proceed to a given meeting name or meeting URL.
     */
    GO_TO_MEETING: 'goToMeeting',

    /**
     * End the current meeting.
     */
    HANG_UP: 'hangup',

    /**
     * Set audio mute on or off.
     */
    SET_AUDIO_MUTE: 'setAudioMute',

    /**
     * Start the screensharing flow or stop screensharing.
     */
    SET_SCREENSHARING: 'setScreensharing',

    /**
     * Set video mute on or off.
     */
    SET_VIDEO_MUTE: 'setVideoMute',

    /**
     * Send the meeting rating and the entered feedback.
     */
    SUBMIT_FEEDBACK: 'submitFeedback'
};
