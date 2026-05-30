/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],

    // Only the React-Native-independent modules (e.g. the `api` message bridge)
    // are unit-tested here; component rendering needs the native runtime, which
    // isn't available in this environment.
    transform: {
        '^.+\\.ts$': [ 'ts-jest', { tsconfig: 'tsconfig.spec.json' } ]
    },
    clearMocks: true,
    restoreMocks: true
};
