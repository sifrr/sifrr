const puppeteer = require('puppeteer');
const Renderer = require('../../src/renderer');
const renderer = new Renderer({ damn: true });
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

  it('has default options', () => {
    const r = new Renderer();

    assert.exists(r.options.beforeRender);
    assert.exists(r.options.afterRender);
  });

  it('launches puppeteer with given options', async () => {
    sinon.stub(puppeteer, 'launch').resolves({ on: () => {} });
    await renderer.launchBrowser();

    assert(puppeteer.launch.calledWith({
      headless: process.env.HEADLESS !== 'false',
      args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
      damn: true
    }));
  });

  it('close', async () => {
    const r = new Renderer();
    const close = sinon.spy();
    sinon.stub(puppeteer, 'launch').resolves({ close: close, on: () => {} });
    r.close();

    assert.notEqual(close.called, true); // Not close if not launched

    await r.launchBrowser();
    r.close();

    assert(close.called); // Closed if launched
  });

  it('isHTML', () => {
    assert.equal(renderer.isHTML(res), false);
    assert.equal(renderer.isHTML(resHtml), true);
  });

  it('renders false if res is not html', async () => {
    const r = new Renderer({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }, {
      cacheKey: (req) => req.fullUrl
    });
    r.isHTML = () => false;
    const reqq = {
      fullUrl: 'about:blank'
    };

    const res = await r.render(reqq);
    assert.equal(res, false);
    await r.close();
  });
});
