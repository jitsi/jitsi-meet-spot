const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:8000';

module.exports = {
    JOIN_CODE_ENTRY_URL: TEST_SERVER_URL,

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

    SPOT_URL: `${TEST_SERVER_URL}/spot`
};
