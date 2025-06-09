import { runLoadTest } from './utils';
import { test } from '@playwright/test';
import { LoadTestResult } from 'loadtest';
import { Cluster } from 'cluster';
import { launchCluster } from '@/index';
import app from '../server';

export const EPORT = 7777;
export const SPORT = 6006;
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
  expect(cluser.totalErrors).toBe(0);
};

const maxReq = 1000;

test.describe('speed test - sifrr & sifrr-cluster', function () {
  let server: Cluster | undefined;
  test.beforeAll(async () => {
    server = launchCluster(app, EPORT);
  });

  test.afterAll(() => {
    for (const w of Object.values(server?.workers ?? {})) {
      w?.kill();
    }
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
