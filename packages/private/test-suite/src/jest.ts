import { pathsToModuleNameMapper } from 'ts-jest';

export const getJestConfig = (paths: Record<string, string[]>) => ({
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec).ts'],
  moduleNameMapper: pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' })
});
