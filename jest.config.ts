import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  // Indicates that this is a TypeScript project
  preset: 'ts-jest',
  // The test environment that will be used for testing
  testEnvironment: 'node',
  // The root directory that Jest should scan for tests and modules
  rootDir: '.',
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  // An array of file extensions your modules use
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*.{ts}', '!src/**/*.d.ts'],
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',
  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['node_modules', 'src'],
  // A list of paths to modules that run some code to configure or set up the testing environment
  // setupFiles: ['<rootDir>/jest.setup.js'],
  // Ignore certain directories
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  // Transform files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

export default config;
