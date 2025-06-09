const { getJestConfig } = require('@sifrr/test-suite');
const { compilerOptions } = require('./tsconfig.json');

module.exports = getJestConfig(compilerOptions.paths);
