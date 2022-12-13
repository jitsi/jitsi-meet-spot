/* global process */
process.env.TZ = 'UTC';

module.exports = {
    modulePaths: [
        '<rootDir>/src'
    ],
    setupFilesAfterEnv: [
        '<rootDir>/setupTests.js'
    ],
    testMatch: [
        '<rootDir>/src/**/?(*.)+(test).js?(x)'
    ],
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!@jitsi/js-utils)'
    ],
    verbose: true
};
