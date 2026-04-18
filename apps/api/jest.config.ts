import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  moduleNameMapper: {
    '^@defi-copilot/(.*)$': '<rootDir>/../../packages/$1/src',
    '^@prisma/client$': '<rootDir>/src/__mocks__/prisma-client.ts',
  },
};

export default config;
