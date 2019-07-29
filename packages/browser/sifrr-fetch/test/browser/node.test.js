global.fetch = require('node-fetch');
const fetch = require('../../src/sifrr.fetch').default;

describe('works with node', () => {
  it('gets request', async () => {
    const resp = await fetch.get(`${PATH}/ok.json`);
    expect(resp).to.deep.equal({
      from: 'file'
    });
  });

  it('posts request', async () => {
    const resp = await fetch.post(`${PATH}/post`, {
      body: {
        ok: 'ok'
      }
    });
    expect(resp).to.deep.equal({
      ok: 'ok'
    });
  });
});
