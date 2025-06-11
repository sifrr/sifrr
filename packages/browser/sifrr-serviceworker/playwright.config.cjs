const { defineConfig } = require('@playwright/test');
const { playwrightConfigOptions } = require('@sifrr/test-suite');

module.exports = defineConfig({
  ...playwrightConfigOptions,
  webServer: {
    command: 'npm run test:server',
    url: 'http://localhost:6007',
    reuseExistingServer: !process.env.CI
  }
});
