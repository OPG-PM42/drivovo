const { nxPreset } = require('@nx/jest/preset/jest-preset');

module.exports = {
  ...nxPreset,
  displayName: 'admin',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/admin',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: true,
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@angular|rxjs)/)',
  ],
  moduleFileExtensions: ['ts', 'mjs', 'js', 'html'],
  testEnvironment: 'node',
  testEnvironmentOptions: {},
};
