import { expect, Page } from '@playwright/test';
import { loadTest, LoadTestResult } from 'loadtest';

export const EPORT = 7777;
export const SPORT = 6006;
const EPATH = `http://localhost:${EPORT}`;
const PATH = `http://localhost:${SPORT}`;

function clean(results: any) {
  const ans: any = {};
  ['rps', 'meanLatencyMs', 'totalRequests', 'totalErrors', 'totalTimeSeconds'].forEach(
    (i) => (ans[i] = results[i])
  );
  return ans;
}

export const runLoadTest = async (
  url: (p: string) => string,
  compress = false,
  maxRequests = 5000
) => {
  const expressResults: LoadTestResult = await new Promise((res, rej) => {
    loadTest(
      {
        url: url(EPATH),
        concurrency: 8,
        maxSeconds: 5,
        maxRequests,
        headers: compress
          ? {
              'accept-encoding': 'gzip'
            }
          : undefined
      },
      (e: unknown, info: LoadTestResult) => {
        res(info);
      }
    );
  });
  const sifrrResults: LoadTestResult = await new Promise((res, rej) => {
    loadTest(
      {
        url: url(PATH),
        concurrency: 8,
        maxSeconds: 5,
        maxRequests,
        headers: compress
          ? {
              'accept-encoding': 'gzip'
            }
          : undefined
      },
      (e: unknown, info: LoadTestResult) => {
        res(info);
      }
    );
  });
  global.console.table({ sifrr: clean(sifrrResults), express: clean(expressResults) });
  expect(sifrrResults.rps).toBeGreaterThanOrEqual(expressResults.rps);
  expect(sifrrResults.meanLatencyMs).toBeLessThanOrEqual(expressResults.meanLatencyMs);
  expect(expressResults.totalErrors).toBe(0);
  expect(sifrrResults.totalErrors).toBe(0);
};

export const okTest = async (page: Page, url: any) => {
  const st = (await page.goto(url))?.status();
  return st && st < 400;
};
