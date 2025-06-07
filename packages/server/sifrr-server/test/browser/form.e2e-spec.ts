import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { test, expect, ElementHandle } from '@playwright/test';

test.describe('form test', function () {
  test.beforeAll(async ({ page }) => {
    await page.goto(`/multipart.html`);
  });

  test('handles input form data', async ({ page }) => {
    const resp = await page.evaluate(async () => {
      return await (window as any).submitForm2(`/stream`);
    });

    expect(resp).toEqual({
      firstname: 'Aaditya',
      lastname: 'Taparia',
      address: ['address1', 'address2', 'address3'],
      some: ['some1', 'some2', 'some3'],
      name: ['Aaditya']
    });
  });

  test('gives uploaded files as stream', async ({ page }) => {
    const fileInput = (await page.$('#onefile'))! as ElementHandle<HTMLInputElement>;
    fileInput.setInputFiles(join(__dirname, '../public/nocl.json'));

    const filesInput = (await page.$('#mulfile')) as ElementHandle<HTMLInputElement>;
    filesInput.setInputFiles([
      join(__dirname, '../public/static.html'),
      join(__dirname, '../public/all.js')
    ]);

    const resp = await page.evaluate(async () => {
      return await (window as any).submitForm(`/buffer`);
    });

    // Response doesn't have filePath
    expect(resp).toEqual({
      name: 'Aaditya',
      file: {
        filename: 'nocl.json',
        encoding: '7bit',
        mimetype: 'application/json'
      },
      file2: [
        {
          filename: 'static.html',
          encoding: '7bit',
          mimetype: 'text/html'
        },
        {
          filename: 'all.js',
          encoding: '7bit',
          mimetype: 'text/javascript'
        }
      ]
    });
  });

  test('gives uploaded file and saves in tmpDir', async ({ page }) => {
    const { resp2, time } = await page.evaluate(async () => {
      const start = performance.now();
      let resp;
      for (let i = 0; i < 100; i++) {
        resp = await (window as any).submitForm(`/tmpdir`);
      }
      return { resp2: resp, time: performance.now() - start };
    });

    global.console.log(`100 file uploads took: ${time}ms`);

    // Response has filePath
    expect(resp2).toEqual({
      name: 'Aaditya',
      file: {
        filename: 'nocl.json',
        encoding: '7bit',
        mimetype: 'application/json',
        filePath: join(__dirname, '../public/tmp/nocl.json')
      },
      file2: [
        {
          filename: 'static.html',
          encoding: '7bit',
          mimetype: 'text/html',
          filePath: join(__dirname, '../public/tmp/static.html')
        },
        {
          filename: 'all.js',
          encoding: '7bit',
          mimetype: 'text/javascript',
          filePath: join(__dirname, '../public/tmp/some.js')
        }
      ]
    });

    // Same file content
    expect(readFileSync(resp2.file.filePath)).toEqual(
      readFileSync(join(__dirname, '../public/nocl.json'))
    );

    // delete files
    unlinkSync(resp2.file2[0].filePath);
    unlinkSync(resp2.file2[1].filePath);
  });
});
