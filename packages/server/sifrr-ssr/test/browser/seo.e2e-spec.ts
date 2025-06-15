import { test, expect } from '@playwright/test';
import axios from 'axios';

async function loadTime(page) {
  return page.evaluate(() => {
    return (
      (window.performance.getEntriesByName('responseEnd')[0]?.startTime ?? 0) -
      (window.performance.getEntriesByName('requestStart')[0]?.startTime ?? 0)
    );
  });
}

const getDuration = (time: [number, number]) => time[0] * 1000 + time[1] / 1000000;

export const SPORT = parseInt(process.env.PORT ?? '6006');
const PATH = `http://localhost:${SPORT}`;

// With sr are because of setting onRender option

test.describe('sifrr-ssr', () => {
  test.describe('js disabled', () => {
    test('renders correctly', async () => {
      const start = process.hrtime();
      const { data, headers } = await axios.get(`${PATH}/`);
      const time1 = getDuration(process.hrtime(start));

      const start2 = process.hrtime();
      await axios.get(`${PATH}/`);
      const time2 = getDuration(process.hrtime(start2));

      delete headers['date'];
      expect(data).toMatchSnapshot();
      expect(headers['x-ssr-powered-by']).toEqual('@sifrr/ssr');
      expect(JSON.stringify(headers, null, 2)).toMatchSnapshot();
      expect(time2).toBeLessThan(time1);
    });
  });

  test.describe('js enabled', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${PATH}/`);
    });

    test('renders sifrr-test again locally (with sr)', async ({ page }) => {
      const html = await page.$eval('sifrr-test', async (el) => {
        await customElements.whenDefined('sifrr-test');
        return el.shadowRoot?.innerHTML;
      });

      expect(html).toContain('Simple element');
      expect(html).toContain('2');
    });

    test('renders sifrr-nosr again locally (without sr)', async ({ page }) => {
      const html = await page.$eval('sifrr-nosr', async (el) => {
        await customElements.whenDefined('sifrr-nosr');
        return el.innerHTML;
      });

      expect(html).toContain('<p>No shadow root</p>');
      expect(html).toContain('<p>1</p>');
    });
  });

  test("doesn't render non html files", async () => {
    const { data, headers } = await axios.get(`${PATH}/elements/nosr.js`);
    expect(data).toMatchSnapshot();
    delete headers['date'];
    expect(headers['x-ssr-powered-by']).toBeUndefined();
    expect(JSON.stringify(headers, null, 2)).toMatchSnapshot();
  });

  test("doesn't render other requests than GET", async () => {
    const { data, headers } = await axios.post(`${PATH}/post`);
    expect(data).toMatchSnapshot();
    delete headers['date'];
    expect(headers['x-ssr-powered-by']).toBeUndefined();
    expect(JSON.stringify(headers, null, 2)).toMatchSnapshot();
  });
});
