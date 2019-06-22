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
        '<rootDir>/node_modules/(?!js-utils)'
    ],
    verbose: true
};
