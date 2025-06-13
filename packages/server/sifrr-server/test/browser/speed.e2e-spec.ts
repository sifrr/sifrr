import { runLoadTest } from './utils';
import express from 'express';
import { test, expect } from '@playwright/test';
import { Server } from 'http';
import { join } from 'path';
import compression from 'compression';
import { LoadTestResult } from 'loadtest';

export const EPORT = 7777;
export const SPORT = (global as any).__PORT ?? 6006;
const EPATH = `http://localhost:${EPORT}`;
const PATH = `http://localhost:${SPORT}`;

const eapp = express();

eapp.use(compression());
eapp.use(express.static(join(import.meta.dirname, '../public')));

const checkResult = ({
  sifrr,
  express
}: {
  sifrr: LoadTestResult;
  express: LoadTestResult;
}): void => {
  expect(sifrr.rps).toBeGreaterThanOrEqual(express.rps);
  expect(sifrr.meanLatencyMs).toBeLessThanOrEqual(express.meanLatencyMs);
  expect(sifrr.totalErrors).toBe(0);
  expect(express.totalErrors).toBe(0);
};

const _listen = eapp.listen;
let listening = false;
(eapp as any).listen = (port: number, handle: () => void) => {
  if (listening) return;
  listening = true;
  _listen.call(eapp, port, handle);
};

const maxReq = 1000;

test.describe('speed test - sifrr vs express', function () {
  let server: Server;
  test.beforeAll(async () => {
    server = eapp.listen(EPORT, () => global.console.log('listening express on ', EPORT));
  });

  test.afterAll(() => {
    server?.close();
  });

  test('faster in static files (small)', async () => {
    global.console.log('# small file');
    checkResult(
      await runLoadTest(
        {
          sifrr: `${PATH}/304.json`,
          express: `${EPATH}/304.json`
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
          express: `${EPATH}/304.json`
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
          express: `${EPATH}/big.html`
        },
        false,
        maxReq
      )
    );
  });

  test.fixme('faster in static files (big, compression)', async () => {
    await new Promise((res) => setTimeout(res, 1000));
    global.console.log('# big file with gzip compression');
    checkResult(
      await runLoadTest(
        {
          sifrr: `${PATH}/big.html`,
          express: `${EPATH}/big.html`
        },
        true,
        maxReq
      )
    );
  });
});
