const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://127.0.0.1:8000';

module.exports = {
    /**
     * The refresh token to use when testing using the backend integration so the Spot-TV can connect to the backend.
     */
    BACKEND_REFRESH_TOKEN: process.env.BACKEND_REFRESH_TOKEN,

    /**
     * The name of the video file which should be used by Chrome as the video
     * to display while using a fake camera. A file with a static image is used
     * so the fake camera source can be used as a screenshare dongle source
     * without triggering Spot-TV's camera input change detection which would
     * automatically start a meeting.
     */
    FAKE_SCREENSHARE_FILE_NAME: 'static-image.y4m',

    /**
     * Direct URL to visible to see instructions on how to use Spot.
     */
    HELP_PAGE_URL: `${TEST_SERVER_URL}/help`,

    /**
     * The direct URL to visit to start the flow for becoming a Spot-Remote for
     * a Spot-TV.
     */
    JOIN_CODE_ENTRY_URL: TEST_SERVER_URL,

    /**
     * FIXME: lower the timeout once websockets are enabled for PR tests.
     *
     * The maximum amount of time, in milliseconds, to allow a page to load.
     * Delays can happen when a Spot-TV attempts to create a connection while
     * a previous sessions of Spot-TV is still active.
     */
    MAX_PAGE_LOAD_WAIT: 120000,

    /**
     * The maximum amount of time, in milliseconds, to allow Jitsi-Meet to load
     * and join a meeting.
     */
    MEETING_JOIN_WAIT: 15000,

    /**
     * The maximum amount of time, in milliseconds, to allow Jitsi-Meet to load.
     */
    MEETING_LOAD_WAIT: 20000,

    /**
     * The amount of time to wait for a Spot-Remote and Spot-TV to create a
     * peer-to-peer connection to each other.
     */
    P2P_ESTABLISHED_WAIT: 10000,

    /**
     * The maximum amount of time, in milliseconds, for a Spot-Remote to wait
     * for the Spot-TV to update its state after a command is sent.
     */
    REMOTE_COMMAND_WAIT: 10000,

    /**
     * Name of capability for the multiremote WDIO testrunner of the remote control browser.
     */
    REMOTE_CONTROL_BROWSER: 'remoteControlBrowser',

    /**
     * FIXME: lower the timeout once websockets are enabled for PR tests.
     * The max amount to wait for the signaling connection (XMPP) to go to a
     * disconnected state.
     */
    SIGNALING_DISCONNECT_TIMEOUT: 60000,

    /**
     * Name of capability for the multiremote WDIO testrunner of the spot browser.
     */
    SPOT_BROWSER: 'spotBrowser',

    /**
     * The direct URL to visit to for a browser to act as a Spot-TV.
     */
    SPOT_URL: `${TEST_SERVER_URL}/tv`
};
