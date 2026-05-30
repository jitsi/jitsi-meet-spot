/** @type {import('jest').Config} */
export default {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    extensionsToTreatAsEsm: ['.ts'],

    // Source is ESM and imports carry explicit `.js` extensions; map them back to
    // the `.ts` sources so ts-jest can resolve and transform them.
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    transform: {
        '^.+\\.ts$': [ 'ts-jest', { useESM: true } ]
    },
    clearMocks: true,
    restoreMocks: true
};
