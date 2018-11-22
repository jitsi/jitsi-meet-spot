/**
 * An enumeration of supported commands Spot can processes. All values are from
 * events triggered by the jitsi meet iframe api.
 */
export const COMMANDS = {
    /**
     * End the current meeting.
     */
    HANG_UP: 'hangup',

    /**
     * Send the meeting rating and the entered feedback.
     */
    SUBMIT_FEEDBACK: 'submitFeedback',

    /**
     * Set audio mute on or off.
     */
    TOGGLE_AUDIO_MUTE: 'toggleAudio',

    /**
     * Start the screensharing flow or stop screensharing.
     */
    TOGGLE_SCREENSHARE: 'toggleShareScreen',

    /**
     * Set video mute on or off.
     */
    TOGGLE_VIDEO_MUTE: 'toggleVideo'
};
