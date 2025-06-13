import ws from 'isomorphic-ws';
(global as any).WebSocket = ws;
import { Fetch, Socket } from '@/index';
import { test, expect } from '@playwright/test';
import http from 'http';
import axios from 'axios';
import wsapp from './wsserver';

function getCliArg(name: string) {
  const argi = Math.max(process.argv.indexOf(`--${name}`), process.argv.indexOf(`-${name[0]}`));
  if (argi !== -1) {
    return process.argv[argi + 1];
  }
  return undefined;
}

const port = parseInt(getCliArg('port') ?? '6006');
const PATH = `http://localhost:${port}`;

function getByHttp() {
  return new Promise((res, rej) => {
    http
      .get(`${PATH}/ok.json`, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          res(JSON.parse(data));
        });
      })
      .on('error', rej);
  });
}
function getMs(tuple: [number, number]): number {
  return tuple[0] * 1000 + tuple[1] / 1000000;
}

const wsport = 7700;
test.describe('Sifrr Fetch', () => {
  const fetchInstance = new Fetch({ baseUrl: PATH });

  beforeAll(() => {
    wsapp.listen(wsport, () => {
      console.log('listening on ', wsport);
    });
  });

  afterAll(async () => {
    (global as any).WebSocket = undefined;
    wsapp.close();
  });

  test('can send get request', async () => {
    const { data, response, ok, errorData } = await fetchInstance.get('/get');

    expect(data).toBeUndefined();
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
    expect(await response?.text()).toEqual('ok');
  });

  test('can send get json request', async () => {
    const { data, ok, errorData } = await fetchInstance.get('/get-json');

    expect(data).toEqual({ ok: 'ok' });
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can send post request', async () => {
    const { data, ok, errorData } = await fetchInstance.post('/post', { ok: 'yes' });

    expect(data).toEqual({ ok: 'yes' });
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can send put request', async () => {
    const { data, ok, errorData } = await fetchInstance.put('/put', { ok: 'yeww' });

    expect(data).toEqual({ ok: 'yeww' });
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can send delete request', async () => {
    const { ok, errorData } = await fetchInstance.delete('/delete/1');

    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can fail delete request', async () => {
    const { ok, errorData, status } = await fetchInstance.delete('/delete/2');

    expect(errorData).toBeUndefined();
    expect(ok).toBeFalsy();
    expect(status).toEqual(404);
  });

  it('works with sockets', async () => {
    const sock = new Socket(`ws://localhost:${wsport}/ws`);
    expect((await sock.fetch({ ok: true })).dataYouSent).toEqual({ ok: true });
    sock.close();
  });

  test('speed test', async () => {
    const startNode = process.hrtime();
    for (let i = 0; i < 300; i++) {
      await getByHttp();
    }
    const endNode = process.hrtime();

    const startFetch = process.hrtime();
    for (let i = 0; i < 300; i++) {
      await fetchInstance.get(`/ok.json`);
    }
    const endFetch = process.hrtime();

    const startAxios = process.hrtime();
    for (let i = 0; i < 300; i++) {
      await axios.get(`${PATH}/ok.json`).then((r) => r.data);
    }
    const endAxios = process.hrtime();

    const nodeTime = getMs(endNode) - getMs(startNode);
    const fetchTime = getMs(endFetch) - getMs(startFetch);
    const axiosTime = getMs(endAxios) - getMs(startAxios);

    console.table({
      nodeTime,
      fetchTime,
      axiosTime
    });
  });
});
