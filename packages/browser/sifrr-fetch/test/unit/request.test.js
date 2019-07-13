const Request = require('../../src/request');

describe('Request', () => {
  it('options', () => {
    const req = new Request('ok', {
      body: 'ok',
      headers: { accept: '*' },
      defaultOptions: {
        headers: { content: 'json' },
        timeout: 5000
      }
    });

    expect(req.options).to.deep.equal({
      body: 'ok',
      headers: { accept: '*', content: 'json' },
      timeout: 5000,
      redirect: 'follow'
    });
  });

  it('url', () => {
    const req = new Request('/ok', {
      host: 'ok',
      params: {
        param: 'value'
      }
    });

    expect(req.url).to.equal('ok/ok?param=value');
  });
});
