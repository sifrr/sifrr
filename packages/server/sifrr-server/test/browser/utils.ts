import { Page } from '@playwright/test';
import { loadTest, LoadTestResult } from 'loadtest';

function clean(results: any) {
  const ans: any = {};
  ['rps', 'meanLatencyMs', 'totalRequests', 'totalErrors', 'totalTimeSeconds'].forEach(
    (i) => (ans[i] = results[i])
  );
  return ans;
}

export const runLoadTest = async <T extends Record<string, string>>(
  paths: T,
  compress = false,
  maxRequests = 5000
) => {
  const result: Record<keyof typeof paths, LoadTestResult> = {} as any;
  for (const name in paths) {
    result[name] = clean(
      await new Promise((res, rej) => {
        loadTest(
          {
            url: paths[name]!,
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
            if (e) rej(e);
            else res(info);
          }
        );
      })
    );
  }

  global.console.table(result);
  return result;
};

export const okTest = async (page: Page, url: any) => {
  const st = (await page.goto(url))?.status();
  return st && st < 400;
};
