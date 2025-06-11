const { defineConfig } = require('@playwright/test');
const { playwrightConfigOptions } = require('@sifrr/test-suite');

module.exports = defineConfig(playwrightConfigOptions);
