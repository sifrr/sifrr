const SifrrSeo = require('../../src/sifrr.seo');
const seo = new SifrrSeo();
const req = {
  originalUrl: '/index.html'
};

describe('SifrrSeo', () => {
  it('fullUrl', () => {
    assert.equal(seo.fullUrl(req), 'http://127.0.0.1:80/index.html');
  });
});
