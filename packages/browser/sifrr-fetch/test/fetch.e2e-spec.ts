import { Fetch } from '@/index';
import { test, expect } from '@playwright/test';

import fetch from 'node-fetch';

(global as any).fetch = fetch;

test.describe('Sifrr Fetch', () => {
  const fetch = new Fetch({ baseUrl: 'http://localhost:6006' });

  test('can send get request', async () => {
    const { data, response, ok, errorData } = await fetch.get('/get');

    expect(data).toBeUndefined();
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
    expect(await response?.text()).toEqual('ok');
  });

  test('can send get json request', async () => {
    const { data, ok, errorData } = await fetch.get('/get-json');

    expect(data).toEqual({ ok: 'ok' });
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can send post request', async () => {
    const { data, ok, errorData } = await fetch.post('/post', { ok: 'yes' });

    expect(data).toEqual({ ok: 'yes' });
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can send put request', async () => {
    const { data, ok, errorData } = await fetch.put('/put', { ok: 'yeww' });

    expect(data).toEqual({ ok: 'yeww' });
    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can send delete request', async () => {
    const { ok, errorData } = await fetch.delete('/delete/1');

    expect(errorData).toBeUndefined();
    expect(ok).toBeTruthy();
  });

  test('can fail delete request', async () => {
    const { ok, errorData, status } = await fetch.delete('/delete/2');

    expect(errorData).toBeUndefined();
    expect(ok).toBeFalsy();
    expect(status).toEqual(404);
  });
});
