import { test, expect } from '@playwright/test';
import sapp, { SPORT } from '../server-ssl';

test.use({
  ignoreHTTPSErrors: true
});

test.describe('ssl app', function () {
  test.beforeAll(() => {
    sapp.listen(6100, () => global.console.log('listening sifrr on ', SPORT));
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`https://localhost:${SPORT}/`);
  });

  test.afterAll(() => {
    sapp.close();
  });

  test('ssl works', async ({ page }) => {
    expect(await page.title()).toEqual('Sifrr Server');
  });
});
