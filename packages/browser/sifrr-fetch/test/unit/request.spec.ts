import Request from '@/request';

describe('Request', () => {
  it('options', () => {
    const req = new Request('http://ok', {
      body: 'ok',
      headers: { accept: '*', content: 'json' },
      timeout: 5000
    });

    expect(req.options).toEqual({
      body: 'ok',
      headers: { accept: '*', content: 'json' },
      timeout: 5000,
      redirect: 'follow'
    });
  });

  it('url', () => {
    const req = new Request('/ok', {
      baseUrl: 'http://ok.com',
      params: {
        param: 'value'
      }
    });

    expect(req.url).toEqual('http://ok.com/ok?param=value');
  });
});
