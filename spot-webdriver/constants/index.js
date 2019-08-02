const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:8000';

module.exports = {
    /**
     * The pairing code to use when testing using the backend integration so
     * the Spot-TV can connect to the backend.
     */
    BACKEND_PAIRING_CODE: process.env.BACKEND_PAIRING_CODE,

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
     * The maximum amount of time, in milliseconds, to allow a page to load.
     * Delays can happen when a Spot-TV attempts to create a connection while
     * a previous sessions of Spot-TV is still active.
     */
    MAX_PAGE_LOAD_WAIT: 90000,

    /**
     * The maximum amount of time, in milliseconds, to allow Jitsi-Meet to load
     * and join a meeting.
     */
    MEETING_JOIN_WAIT: 15000,

    /**
     * The maximum amount of time, in milliseconds, for Spot-Remote to wait for
     * Spot-TV to update its state after a command is sent.
     */
    REMOTE_COMMAND_WAIT: 5000,

    /**
     * The direct URL to visit to for a browser to act as a Spot-TV.
     */
    SPOT_URL: `${TEST_SERVER_URL}/spot`
};
