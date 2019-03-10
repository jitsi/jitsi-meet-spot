const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://localhost:8000';

module.exports = {
    JOIN_CODE_ENTRY_URL: TEST_SERVER_URL,
    SPOT_URL: `${TEST_SERVER_URL}/spot`
};
