const SifrrSeo = require('../../src/sifrr.seo');
const seo = new SifrrSeo(undefined, {
  ttl: 0.001,
  maxCacheSize: 0.000010 // In MB, 10 Bytes
});
const req = {
  fullUrl: '/index.html',
  headers: {
    'user-agent': 'Googlebot',
  }
};
const req2 = {
  fullUrl: '/index2.html',
  headers: {
    'user-agent': 'Googlebot',
  }
};

describe('SifrrSeo', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('has default options', () => {
    assert.equal(seo.options.fullUrl({ originalUrl: '/index.html' }), 'http://127.0.0.1:80/index.html');
  });

  describe('calling renderer', () => {
    it('calls renderer with given options', () => {
      const stubRen = sinon.spy(SifrrSeo, 'Renderer');
      const s = new SifrrSeo(['Opera'], { c: 'd' });
      s.setPuppeteerOption('h', false);
      s.renderer;
      s.close();

      assert(stubRen.calledOnce);
      expect(stubRen.firstCall.args[0]).to.deep.equal({ h: false });
      assert.equal(stubRen.firstCall.args[1].c, 'd');
      assert.notExists(stubRen.firstCall.args[2]);
    });

    it('calls next() if shouldRenderCache is false', async () => {
      const m = seo.middleware;
      sinon.stub(seo, 'render').resolves(false);
      sinon.stub(seo, 'getShouldRenderCache').returns(true);
      sinon.stub(seo.options, 'fullUrl').returns('http://');
      const next = sinon.spy();
      seo.shouldRenderCache[seo.options.cacheKey(req)] = false;

      await m({
        method: 'GET',
        headers: {}
      }, {}, next);

      assert(next.calledOnce);
    });
  });

  describe('cache', () => {
    it('can manually take cache store', () => {
      const Cache = require('cache-manager');
      const store = Cache.caching().store;

      const r = new SifrrSeo([], {
        cacheStore: store
      });

      assert.equal(r.cache.store, store);
    });

    it('returns from cache if there is a response', async () => {
      const seo2 = new SifrrSeo();
      seo2.cache.set(seo2.options.cacheKey(req2), 'v');

      assert.equal(await seo2.render(req2), 'v');
    });

    it('clears cache', async () => {
      seo.cache.set('a', 'b');
      seo.cache.get('a', (err, res) => {
        assert.equal(res, 'b');
      });

      seo.clearCache();

      seo.cache.get('a', (err, res) => {
        assert.notExists(res);
      });
    });

    it('has cache', () => {
      assert(seo.cache);
    });

    it('cache expires after ttl', async () => {
      seo.cache.set('a', 'b');
      seo.cache.get('a', (err, res) => {
        assert.equal(res, 'b');
      });

      await delay(0.01);

      seo.cache.get('a', (err, res) => {
        assert.notExists(res);
      });
    });

    it('expires after size exceeded', async () => {
      seo.cache.set('a', 'abcd');
      seo.cache.get('a', (err, res) => {
        assert.equal(res, 'abcd');
      });

      seo.cache.set('b', 'abcd');
      seo.cache.get('a', (err, res) => {
        assert.notExists(res);
      });
      seo.cache.get('b', (err, res) => {
        assert.equal(res, 'abcd');
      });
    });
  });
});
