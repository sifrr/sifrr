import { readFileSync } from 'fs';
import { join } from 'path';
import { test, expect, ElementHandle } from '@playwright/test';
const __dirname = import.meta.dirname;

test.describe('form test', function () {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/multipart.html`);
  });

  test('handles input form data', async ({ page }) => {
    const resp = await page.evaluate(async () => {
      return await (window as any).submitForm2(`/stream`);
    });

    expect(resp.data).toEqual({
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
    await filesInput.setInputFiles([
      join(__dirname, '../public/static.html'),
      join(__dirname, '../public/304.json')
    ]);

    const resp = await page.evaluate(async () => {
      return await (window as any).submitForm(`/buffer`);
    });

    const bfr = resp.data.file.buffer;
    const bfr2 = resp.data.file2[0].buffer;
    const bfr3 = resp.data.file2[1].buffer;

    delete resp.data.file.buffer;
    delete resp.data.file2[0].buffer;
    delete resp.data.file2[1].buffer;
    delete resp.data.file.stream;
    delete resp.data.file2[0].stream;
    delete resp.data.file2[1].stream;

    expect(bfr.data.length).toEqual(249);
    expect(bfr2.data.length).toEqual(1372);
    expect(bfr3.data.length).toEqual(
      readFileSync(join(__dirname, '../public/304.json')).byteLength
    );

    // Response doesn't have filePath
    expect(resp.data).toEqual({
      name: 'Aaditya',
      file: {
        encoding: '7bit',
        fieldname: 'file',
        mimeType: 'application/json',
        originalname: 'nocl.json',
        size: 249
      },
      file2: [
        {
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'text/html',
          originalname: 'static.html',
          size: 1372
        },
        {
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'application/json',
          originalname: '304.json',
          size: readFileSync(join(__dirname, '../public/304.json')).byteLength
        }
      ]
    });
  });

  test('gives uploaded file and saves in tmpDir', async ({ page }) => {
    const fileInput = (await page.$('#onefile'))! as ElementHandle<HTMLInputElement>;
    fileInput.setInputFiles(join(__dirname, '../public/nocl.json'));

    const filesInput = (await page.$('#mulfile')) as ElementHandle<HTMLInputElement>;
    await filesInput.setInputFiles([
      join(__dirname, '../public/static.html'),
      join(__dirname, '../public/304.json')
    ]);

    const { resp, time } = await page.evaluate(async () => {
      const start = performance.now();
      let resp;
      for (let i = 0; i < 100; i++) {
        resp = await (window as any).submitForm(`/tmpdir`);
      }
      return { resp, time: performance.now() - start };
    });

    global.console.log(`100 file uploads took: ${time}ms`);

    const file = resp.data.file.path;
    const file2 = resp.data.file2[0].path;
    const file3 = resp.data.file2[1].path;

    delete resp.data.file.path;
    delete resp.data.file2[0].path;
    delete resp.data.file2[1].path;
    delete resp.data.file.stream;
    delete resp.data.file2[0].stream;
    delete resp.data.file2[1].stream;

    const destination = join(__dirname, '../tmp');

    // Response doesn't have filePath
    expect(resp.data).toEqual({
      name: 'Aaditya',
      file: {
        destination,
        encoding: '7bit',
        fieldname: 'file',
        mimeType: 'application/json',
        originalname: 'nocl.json',
        size: 249
      },
      file2: [
        {
          destination,
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'text/html',
          originalname: 'static.html',
          size: 1372
        },
        {
          destination,
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'application/json',
          originalname: '304.json',
          size: readFileSync(join(__dirname, '../public/304.json')).byteLength
        }
      ]
    });

    // Same file content
    expect(readFileSync(file)).toEqual(readFileSync(join(__dirname, '../public/nocl.json')));
    expect(readFileSync(file2)).toEqual(readFileSync(join(__dirname, '../public/static.html')));
    expect(readFileSync(file3)).toEqual(readFileSync(join(__dirname, '../public/304.json')));

    expect(file.replace(destination, '')).toMatch(/^\/[a-zA-Z0-9-]+\.json$/);
    expect(file2.replace(destination, '')).toMatch(/^\/[a-zA-Z0-9-]+\.html$/);
    expect(file3.replace(destination, '')).toMatch(/^\/[a-zA-Z0-9-]+\.json$/);
  });

  test('gives uploaded file upto max count 5', async ({ page }) => {
    const fileInput = (await page.$('#onefile'))! as ElementHandle<HTMLInputElement>;
    fileInput.setInputFiles(join(__dirname, '../public/nocl.json'));

    const filesInput = (await page.$('#mulfile')) as ElementHandle<HTMLInputElement>;
    await filesInput.setInputFiles([
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json')
    ]);

    const { resp } = await page.evaluate(async () => {
      const resp = await (window as any).submitForm(`/tmpdir`);
      return { resp };
    });

    delete resp.data.file.path;
    delete resp.data.file2[0].path;
    delete resp.data.file2[1].path;
    delete resp.data.file2[2].path;
    delete resp.data.file2[3].path;
    delete resp.data.file2[4].path;
    delete resp.data.file.stream;
    delete resp.data.file2[0].stream;
    delete resp.data.file2[1].stream;
    delete resp.data.file2[2].stream;
    delete resp.data.file2[3].stream;
    delete resp.data.file2[4].stream;

    const destination = join(__dirname, '../tmp');

    // Response doesn't have filePath
    expect(resp.data).toEqual({
      name: 'Aaditya',
      file: {
        destination,
        encoding: '7bit',
        fieldname: 'file',
        mimeType: 'application/json',
        originalname: 'nocl.json',
        size: 249
      },
      file2: [
        {
          destination,
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'application/json',
          originalname: '304.json',
          size: readFileSync(join(__dirname, '../public/304.json')).byteLength
        },
        {
          destination,
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'application/json',
          originalname: '304.json',
          size: readFileSync(join(__dirname, '../public/304.json')).byteLength
        },
        {
          destination,
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'application/json',
          originalname: '304.json',
          size: readFileSync(join(__dirname, '../public/304.json')).byteLength
        },
        {
          destination,
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'application/json',
          originalname: '304.json',
          size: readFileSync(join(__dirname, '../public/304.json')).byteLength
        },
        {
          destination,
          encoding: '7bit',
          fieldname: 'file2',
          mimeType: 'application/json',
          originalname: '304.json',
          size: readFileSync(join(__dirname, '../public/304.json')).byteLength
        }
      ]
    });
  });

  test('gives uploaded file upto max count 1', async ({ page }) => {
    const fileInput = (await page.$('#onefile'))! as ElementHandle<HTMLInputElement>;
    fileInput.setInputFiles(join(__dirname, '../public/nocl.json'));

    const filesInput = (await page.$('#mulfile')) as ElementHandle<HTMLInputElement>;
    await filesInput.setInputFiles([
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json')
    ]);

    const { resp } = await page.evaluate(async () => {
      const resp = await (window as any).submitForm(`/tmpdir-1`);
      return { resp };
    });

    delete resp.data.file.path;
    delete resp.data.file2.path;
    delete resp.data.file.stream;
    delete resp.data.file2.stream;

    const destination = join(__dirname, '../tmp');

    // Response doesn't have filePath
    expect(resp.data).toEqual({
      file: {
        destination,
        encoding: '7bit',
        fieldname: 'file',
        mimeType: 'application/json',
        originalname: 'nocl.json',
        size: 249
      },
      file2: {
        destination,
        encoding: '7bit',
        fieldname: 'file2',
        mimeType: 'application/json',
        originalname: '304.json',
        size: readFileSync(join(__dirname, '../public/304.json')).byteLength
      }
    });
  });

  test('gives uploaded file upto max count 0', async ({ page }) => {
    const fileInput = (await page.$('#onefile'))! as ElementHandle<HTMLInputElement>;
    fileInput.setInputFiles(join(__dirname, '../public/nocl.json'));

    const filesInput = (await page.$('#mulfile')) as ElementHandle<HTMLInputElement>;
    await filesInput.setInputFiles([
      join(__dirname, '../public/304.json'),
      join(__dirname, '../public/304.json')
    ]);

    const { resp } = await page.evaluate(async () => {
      const resp = await (window as any).submitForm(`/tmpdir-0`);
      return { resp };
    });

    delete resp.data.file.path;
    delete resp.data.file.stream;

    const destination = join(__dirname, '../tmp');

    // Response doesn't have filePath
    expect(resp.data).toEqual({
      file: {
        destination,
        encoding: '7bit',
        fieldname: 'file',
        mimeType: 'application/json',
        originalname: 'nocl.json',
        size: 249
      },
      file2: undefined
    });
  });
});
