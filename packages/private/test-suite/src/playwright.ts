import { devices, PlaywrightTestConfig } from '@playwright/test';

export const getPlaywrightConfigOptions = (port: number): PlaywrightTestConfig => {
  console.log('Playwright test server using port: ', port);
  process.env.PORT = '' + port;
  return {
    // Look for test files in the "test" directory, relative to this configuration file.
    testDir: 'test',
    testMatch: '**/*.e2e-spec.ts',
    snapshotPathTemplate: '{testDir}/__snapshots__/{testFileName}/{arg}{ext}',

    // Run all tests in parallel.
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code.
    forbidOnly: !!process.env.CI,

    // Retry on CI only.
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI.
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: 'html',

    use: {
      // Base URL to use in actions like `await page.goto('/')`.
      baseURL: `http://localhost:${port}`,

      // Collect trace when retrying the failed test.
      trace: 'on-first-retry'
    },
    // Configure projects for major browsers.
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] }
      }
    ],
    // Run your local dev server before starting the tests.
    webServer: {
      command: `set -ex; PORT=${port} yarn test:server`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI
    }
  };
};
