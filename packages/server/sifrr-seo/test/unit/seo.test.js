const SifrrSeo = require('../../src/sifrr.seo');
const seo = new SifrrSeo();

describe('SifrrSeo', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('middleware', () => {
    it('calls next() if render is false', async () => {
      const m = seo.middleware;
      sinon.stub(seo, 'render').resolves(false);
      sinon.stub(seo.renderer, 'getShouldRenderCache').returns(true);
      sinon.stub(seo.renderer.options, 'fullUrl').returns('http://');
      const next = sinon.spy();

      await m({
        method: 'GET',
        headers: {}
      }, {}, next);

      assert(next.calledOnce);
    });

    it('doesn\'t set shouldRenderCache when res has no content-type', async () => {
      const m = seo.middleware;
      sinon.stub(seo, 'render').resolves(false);
      sinon.stub(seo.renderer.options, 'fullUrl').returns('http://');
      const next = sinon.spy();
      const req = {
        method: 'GET',
        headers: {}
      };
      const res = {
        hasHeader: () => false,
        getHeader: () => 'aa/html/bb',
        end: () => {}
      };

      await m(req, res, next);
      res.end();

      assert.equal(seo.renderer.getShouldRenderCache({
        fullUrl: 'http://',
        headers: {}
      }), null);
    });
  });

  describe('calling renderer', () => {
    it('calls renderer with given options', () => {
      const stubRen = sinon.spy(SifrrSeo, 'Renderer');
      const s = new SifrrSeo(['Opera'], { c: 'd' });
      s.setPuppeteerOption('h', false);
      s.renderer;
      s.close();

      assert(stubRen.calledWith({
        headless: process.env.HEADLESS !== 'false',
        args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
        h: false
      }, { c: 'd' }));
    });
  });

  it('clears cache', async () => {
    seo.renderer.cache.set('a', 'b');
    seo.renderer.cache.get('a', (err, res) => {
      assert.equal(res, 'b');
    });

    seo.clearCache();

    seo.renderer.cache.get('a', (err, res) => {
      assert.notExists(res);
    });
  });
});
