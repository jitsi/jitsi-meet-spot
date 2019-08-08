/**
 * An enumeration of supported commands {@code RemoteControlServer} can process.
 * All values are from events triggered by the Jitsi-Meet iFrame API.
 */
export const COMMANDS = {

    /**
     * Adjust the volume 'up' or 'down'.
     */
    ADJUST_VOLUME: 'adjustVolume',

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
     * Enter or exit tile view layout.
     */
    SET_TILE_VIEW: 'setTileView',

    /**
     * Set video mute on or off.
     */
    SET_VIDEO_MUTE: 'setVideoMute',

    /**
     * Send the meeting rating and the entered feedback.
     */
    SUBMIT_FEEDBACK: 'submitFeedback',

    /**
     * Send the password needed to join a locked meeting.
     */
    SUBMIT_PASSWORD: 'submitPassword'
};

/**
 * An enumeration of custom connection-related events that can be emitted.
 */
export const CONNECTION_EVENTS = {

    /**
     * The {@code RemoteControlServer} is no longer available.
     */
    SERVER_DISCONNECTED: 'server-disconnected'
};

/**
 * An enumeration of custom namespaces to use for iqs.
 */
export const IQ_NAMESPACES = {

    /**
     * The type of iq which should trigger a direction action in response.
     */
    COMMAND: 'jitsi-meet-spot-command',

    /**
     * The type of iq which should trigger passing along of a message.
     */
    MESSAGE: 'jitsi-meet-spot-message'
};

/**
 * How long to wait for an ack until considering an iq to have timed out.
 */
export const IQ_TIMEOUT = 5000;

/**
 * An enumeration of supported messages that can be sent between
 * {@code RemoteControlServer} and {@code RemoteControlClient} instances.
 */
export const MESSAGES = {
    /**
     * A {@code RemoteControlClient} is no longer connected to a
     * {@code RemoteControlServer}.
     */
    CLIENT_LEFT: 'remote-control-client-left',

    /**
     * A {@code RemoteControlClient} has sent a message to a
     * a {@code RemoteControlServer} to pass into a Jitsi-Meet meeting.
     */
    CLIENT_PROXY_MESSAGE: 'remote-control-client-message',

    /**
     * A message about wireless screensharing from Jitsi-Meet, to be sent to
     * a {@code RemoteControlServer} which should resend to a
     * {@code RemoteControlClient}.
     */
    JITSI_MEET_UPDATE: 'update-message-from-jitsi-meet',

    /**
     * A message from a {@code RemoteControlClient} to a
     * {@code RemoteControlServer}, intended to be passed into the Jitsi-Meet
     * meeting.
     */
    REMOTE_CONTROL_UPDATE: 'update-message-from-remote-control'
};

export const SERVICE_UPDATES = {
    /**
     * A {@code RemoteControlClient} has established a new connection with
     * a {@code RemoteControlServer}.
     */
    CLIENT_JOINED: 'remote-control-client-joined',

    /**
     * A {@code RemoteControlClient} is no longer connected to a
     * {@code RemoteControlServer}.
     */
    CLIENT_LEFT: 'remote-control-client-left',

    /**
     * A command from a {@code RemoteControlClient} has been received.
     */
    CLIENT_MESSAGE_RECEIVED: 'message-received',

    /**
     * The remote control service has started or stopped the automatic
     * reconnection flow.
     */
    RECONNECT_UPDATE: 'reconnect-update',

    /**
     * The spot backend service received an updated profile for the connected
     * room.
     */
    REGISTRATION_UPDATED: 'registration-update',

    /**
     * An update to the room join code, triggered locally, has been successfully
     * completed.
     */
    REMOTE_JOIN_CODE_CHANGE: 'remote-join-code-change',

    /**
     * The {@code RemoteControlClient} has received an updated state for the
     * {@code RemoteControlServer}.
     */
    SERVER_STATE_CHANGE: 'remote-control-server-state-change',

    /**
     * The remote control service has lost the XMPP connection and cannot
     * automatically reconnect.
     */
    UNRECOVERABLE_DISCONNECT: 'unrecoverable-disconnect'
};
