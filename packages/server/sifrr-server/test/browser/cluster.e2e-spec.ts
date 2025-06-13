import { runLoadTest, waitForOk } from './utils';
import { test, expect } from '@playwright/test';
import { LoadTestResult } from 'loadtest';
import { ChildProcess, exec } from 'child_process';

export const EPORT = 6010;
export const SPORT = (global as any).__PORT ?? 6006;
const EPATH = `http://localhost:${EPORT}`;
const PATH = `http://localhost:${SPORT}`;

const checkResult = ({
  sifrr,
  cluser
}: {
  sifrr: LoadTestResult;
  cluser: LoadTestResult;
}): void => {
  expect(cluser.rps).toBeGreaterThanOrEqual(sifrr.rps);
  expect(cluser.meanLatencyMs).toBeLessThanOrEqual(sifrr.meanLatencyMs);
  expect(cluser.totalErrors).toBe(0);
  expect(sifrr.totalErrors).toBe(0);
};

const maxReq = 10000;

test.describe.serial('speed test - sifrr & sifrr-cluster', function () {
  let server: ChildProcess | undefined;
  test.beforeAll(async () => {
    server = exec(`yarn test:cluster`);
    server.stdout?.on('data', (m) => {
      console.log(m);
    });
  });

  test.beforeEach(async ({ page }) => {
    await waitForOk(page, `${EPATH}/304.json`);
  });

  test.afterAll(() => {
    server?.kill();
  });

  test('faster in static files (small)', async () => {
    global.console.log('# small file');
    checkResult(
      await runLoadTest(
        {
          sifrr: `${PATH}/304.json`,
          cluser: `${EPATH}/304.json`
        },
        false,
        maxReq
      )
    );
  });

  test('faster in static files (small, compression)', async () => {
    global.console.log('# small file with gzip compression');
    checkResult(
      await runLoadTest(
        {
          sifrr: `${PATH}/304.json`,
          cluser: `${EPATH}/304.json`
        },
        true,
        maxReq
      )
    );
  });

  test('faster in static files (big)', async () => {
    global.console.log('# big file');
    checkResult(
      await runLoadTest(
        {
          sifrr: `${PATH}/big.html`,
          cluser: `${EPATH}/big.html`
        },
        false,
        maxReq
      )
    );
  });

  test('faster in static files (big, compression)', async () => {
    await new Promise((res) => setTimeout(res, 1000));
    global.console.log('# big file with gzip compression');
    checkResult(
      await runLoadTest(
        {
          sifrr: `${PATH}/big.html`,
          cluser: `${EPATH}/big.html`
        },
        true,
        maxReq
      )
    );
  });
});
