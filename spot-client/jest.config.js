/*
 * global process
 */
process.env.TZ = 'UTC';

module.exports = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    modulePaths: [ '<rootDir>/src' ],
    setupFilesAfterEnv: [ '<rootDir>/setupTests.ts' ],
    testEnvironment: 'jsdom',
    testMatch: [ '<rootDir>/src/**/?(*.)+(test).[jt]s?(x)' ],
    transformIgnorePatterns: [ '<rootDir>/node_modules/(?!@jitsi/js-utils)' ],
    verbose: true
};
