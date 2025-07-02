import { test, expect } from '@playwright/test';

const body = {
  thisis: 'text',
  bool: false,
  number: 1234,
  object: {
    yes: 'okay'
  },
  array: ['txt', 2, true]
};

test.describe('json body test', function () {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/static.html`);
  });

  ['post', 'put', 'patch'].forEach((m) => {
    test(`${m}: gives json body on res.body`, async ({ page }) => {
      const resp = await page.evaluate(
        async ([body, m]) => {
          return await (window as any).Sifrr.Fetch.sFetch[m as string](`/${m}`, body);
        },
        [body, m]
      );

      expect(resp.data.body).toEqual(body);
    });
  });

  test(`errors when body buffer is called after body`, async ({ page }) => {
    const resp = await page.evaluate(
      async ([body]) => {
        return await (window as any).Sifrr.Fetch.sFetch.post(`/post`, body);
      },
      [body]
    );

    expect(resp.data.body).toEqual(body);
    expect(resp.data.bodyBuffer).toEqual(
      'Stream was already read. You can only read one of body, bodyBuffer, bodyStream and only once.'
    );
  });

  test(`errors when body is called after buffer`, async ({ page }) => {
    const resp = await page.evaluate(
      async ([body]) => {
        return await (window as any).Sifrr.Fetch.sFetch.post(`/post-buffer`, body);
      },
      [body]
    );

    expect(resp.data.bodyBuffer.data.length).toEqual(91);
    expect(resp.data.body).toEqual(
      'Stream was already read. You can only read one of body, bodyBuffer, bodyStream and only once.'
    );
  });

  test(`errors when body is called after stream`, async ({ page }) => {
    const resp = await page.evaluate(
      async ([body]) => {
        return await (window as any).Sifrr.Fetch.sFetch.post(`/post-stream`, body);
      },
      [body]
    );

    expect(resp.data.stream.data.length).toEqual(91);
    expect(resp.data.body).toEqual(
      'Stream was already read. You can only read one of body, bodyBuffer, bodyStream and only once.'
    );
  });
});
