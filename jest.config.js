/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  testTimeout: 10000,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.test\\.(t|j)s$': 'ts-jest',
  },
};
