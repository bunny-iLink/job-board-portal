export default {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    // extensionsToTreatAsEsm: ['.js'],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.mjs'],  // <- updated
    transform: {},
};
