import { Fetch } from '@/index';

describe('Fetch', () => {
  let fetch: Fetch;

  beforeAll(() => {
    jest.spyOn(Fetch, 'request');
    fetch = new Fetch({
      baseUrl: 'http://ok.ok',
      timeout: 10
    });
  });

  it('calls request with merged options', async () => {
    await fetch
      .post('/ok', { a: 'b' }, { headers: { 'Content-Type': 'application/json' } })
      .catch(() => {});
    expect(Fetch.request).toHaveBeenCalledWith(
      '/ok',
      expect.objectContaining({
        body: { a: 'b' },
        headers: { 'Content-Type': 'application/json' },
        baseUrl: 'http://ok.ok',
        timeout: 10
      }),
      'POST'
    );
  });
});
