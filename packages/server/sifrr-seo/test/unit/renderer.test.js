const puppeteer = require('puppeteer');
const Renderer = require('../../src/renderer');
const renderer = new Renderer({ damn: true }, {
  cacheKey: () => 'key',
  ttl: 0.001,
  maxCacheSize: 0.000010, // In MB, 10 Bytes
  localport: 80
});
const req = {
  fullUrl: '/index.html'
};
const res = {
  headers: () => {
    return { 'content-type': 'asdsad' };
  }
};
const resHtml = {
  headers: () => {
    return { 'content-type': 'asdahtmlasd' };
  }
};

describe('Renderer', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('calls renderOnPuppeteer on render', async () => {
    sinon.stub(renderer, 'renderOnPuppeteer').resolves(true);
    await renderer.render(req);

    assert(renderer.renderOnPuppeteer.calledWith(req));
  });

  it('renders false if res is not html', async () => {
    const r = new Renderer({}, {
      cacheKey: (req) => req.fullUrl
    });
    const reqq = {
      fullUrl: '/image'
    };
    r.shouldRenderCache[r.options.cacheKey(reqq)] = false;

    assert.equal(await r.render(reqq), false);
  });

  it('launches puppeteer with given options', async () => {
    sinon.stub(puppeteer, 'launch').resolves({ on: () => {} });
    await renderer.launchBrowser();

    assert(puppeteer.launch.calledWith({ damn: true }));
  });

  it('close', async () => {
    const r = new Renderer();
    const close = sinon.spy();
    sinon.stub(puppeteer, 'launch').resolves({ close: close, on: () => {} });
    r.close();

    assert.notEqual(close.called, true); // Not close if not launches

    await r.launchBrowser();
    r.close();

    assert(close.called); // Closed if launched
  });

  it('isHTML', () => {
    assert.equal(renderer.isHTML(res), false);
    assert.equal(renderer.isHTML(resHtml), true);
  });

  it('can manually take cache store', () => {
    const cache = 'cache';
    const r = new Renderer({}, {
      cache: cache
    });

    assert.equal(r.cache, cache);
  });

  it('returns from cache if there is a response', async () => {
    renderer.cache.set('key', 'v');

    assert.equal(await renderer.render(req), 'v');
  });

  describe('cache', () => {
    it('has cache', () => {
      assert(renderer.cache);
    });

    it('cache expires after ttl', async () => {
      renderer.cache.set('a', 'b');
      renderer.cache.get('a', (err, res) => {
        assert.equal(res, 'b');
      });

      await delay(0.002);

      renderer.cache.get('a', (err, res) => {
        assert.notExists(res);
      });
    });

    it('expires after size exceeded', async () => {
      renderer.cache.set('a', 'abcd');
      renderer.cache.get('a', (err, res) => {
        assert.equal(res, 'abcd');
      });

      renderer.cache.set('b', 'abcd');
      renderer.cache.get('a', (err, res) => {
        assert.notExists(res);
      });
      renderer.cache.get('b', (err, res) => {
        assert.equal(res, 'abcd');
      });
    });
  });
});
