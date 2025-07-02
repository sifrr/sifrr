import { test, expect } from '@playwright/test';
import { okTest } from 'test/browser/utils';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

test.describe('static test', function () {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/static.html`);
  });

  test('serves base folder', async ({ page }) => {
    expect(await okTest(page, `/nocl.json`)).toEqual(true);
  });

  test('serves all subfolder folders recursively', async ({ page }) => {
    expect(await okTest(page, `/deep/deep/a/b/c/d/index.html`)).toEqual(true);
  });

  test("doesn't serve non-existent files", async ({ page }) => {
    expect(await okTest(page, `/skjshfdk.html`)).toEqual(false);
  });

  test('serves with prefix', async ({ page }) => {
    expect(await okTest(page, `/fetch/index.iife.js`)).toEqual(true);
  });

  test('serves files with pattern', async ({ page }) => {
    expect(await okTest(page, `/random/asdasd`)).toEqual(true);
  });

  test.skip('serves newly created files and 404 for deleted files', async ({ page }) => {
    const filePath = path.join(import.meta.dirname, '../public/abcd');

    fs.writeFileSync(filePath, '');
    await timeout(200);
    const resp = await page.goto(`/abcd`);
    expect(resp?.status()).toEqual(200);

    fs.unlinkSync(filePath);
    await timeout(200);
    const resp2 = await page.goto(`/abcd`);
    expect(resp2?.status()).toEqual(404);
  });

  // for some reason doesn't work in playwright
  test.skip('responds with 304 when not modified and 200 when modified', async ({ page }) => {
    const filePath = path.join(import.meta.dirname, '../public/304.json');

    fs.writeFileSync(filePath, JSON.stringify({ ok: randomUUID() }));
    await timeout(100);

    await page.goto(`/304.json`);

    expect((await page.reload())?.status()).toEqual(200);
    await timeout(100);
    expect((await page.reload())?.status()).toEqual(304);

    await timeout(100);
    fs.writeFileSync(filePath, JSON.stringify({ ok: randomUUID() }));

    expect((await page.reload())?.status()).toEqual(200);
  });
});

function timeout(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
