import { defineConfig } from '@playwright/test';
import pkg from '@sifrr/test-suite';

export default defineConfig({
  ...pkg.playwrightConfigOption,
  webServer: {
    command: 'npm run test:server',
    url: 'http://localhost:6007',
    reuseExistingServer: !process.env.CI
  }
});
