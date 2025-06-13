import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';

export const getJestConfig = (paths: Record<string, string[]>): JestConfigWithTsJest => ({
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec).ts'],
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  extensionsToTreatAsEsm: ['.ts']
});
