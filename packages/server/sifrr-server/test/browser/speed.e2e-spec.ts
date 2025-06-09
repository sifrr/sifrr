import { runLoadTest, EPORT } from './utils';
import express from 'express';
import { test } from '@playwright/test';
import { Server } from 'http';
import { join } from 'path';
import compression from 'compression';

let eapp = express();

eapp.use(compression());
eapp.use(express.static(join(import.meta.dirname, '../public')));

const maxReq = 1000;

test.describe.only('speed test', function () {
  let server: Server;
  test.beforeAll(async () => {
    server = eapp.listen(EPORT, () => global.console.log('listening express on ', EPORT));
  });

  test.afterAll(() => {
    server?.close();
  });

  test('faster in static files (small)', async () => {
    global.console.log('# small file');
    await runLoadTest((p) => `${p}/304.json`, false, maxReq);
  });

  test('faster in static files (small, compression)', async () => {
    global.console.log('# small file with gzip compression');
    await runLoadTest((p) => `${p}/304.json`, true, maxReq);
  });

  test('faster in static files (big)', async () => {
    global.console.log('# big file');
    await runLoadTest((p) => `${p}/big.html`, false, maxReq);
  });

  test('faster in static files (big, compression)', async () => {
    global.console.log('# big file with gzip compression');
    await runLoadTest((p) => `${p}/big.html`, true, maxReq);
  });
});
