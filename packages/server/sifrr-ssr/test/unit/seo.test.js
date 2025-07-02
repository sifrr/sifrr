const SifrrSsr = require('../../src/sifrr.seo');
const seo = new SifrrSsr(undefined, {
  ttl: 0.001,
  maxCacheSize: 0.00001 // In MB, 10 Bytes
});

describe('SifrrSsr', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('calling renderer', () => {
    it('calls renderer with given options', () => {
      const stubRen = sinon.spy(SifrrSsr, 'Renderer');
      const s = new SifrrSsr(['Opera'], { c: 'd' });
      s.setPuppeteerOption('h', false);
      s.renderer;
      s.close();

      assert(stubRen.calledOnce);
      expect(stubRen.firstCall.args[0]).to.deep.equal({ h: false });
      assert.equal(stubRen.firstCall.args[1].c, 'd');
      assert.notExists(stubRen.firstCall.args[2]);
    });

    it('calls next() if shouldRenderCache is false', async () => {
      const m = seo.getExpressMiddleware(() => 'http://');
      sinon.stub(seo, 'render').resolves(false);
      sinon.stub(seo, 'getShouldRenderCache').returns(true);
      const next = sinon.spy();
      seo.shouldRenderCache['http://'] = false;

      await m(
        {
          method: 'GET',
          headers: {}
        },
        {},
        next
      );

      assert(next.calledOnce);
    });
  });

  describe('cache', () => {
    it('can manually take cache store', () => {
      const Cache = require('cache-manager');
      const store = Cache.caching().store;

      const r = new SifrrSsr([], {
        cacheStore: store
      });

      assert.equal(r.cache.store, store);
    });

    it('returns from cache if there is a response', async () => {
      const seo2 = new SifrrSsr(undefined, { cacheKey: () => '/key' });
      seo2.cache.set('/key', 'v');
      sinon.stub(seo2, 'shouldRender').returns(true);

      assert.equal(await seo2.render('http://url'), 'v');
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

    it('cache expires after ttl', (done) => {
      seo.cache.set('a', 'b');
      seo.cache.get('a', (err, res) => {
        assert.equal(res, 'b');

        delay(100).then(() => {
          seo.cache.get('a', (err, res) => {
            assert.notExists(res);
          });
          done();
        });
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
