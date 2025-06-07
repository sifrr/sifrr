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

  it('launches puppeteer with given options', async () => {
    sinon.stub(puppeteer, 'launch').resolves({ on: () => {} });
    await renderer.browserAsync();

    assert(
      puppeteer.launch.calledWith({
        headless: process.env.HEADLESS !== 'false',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        damn: true
      })
    );
  });

  it('close', async () => {
    const r = new Renderer();
    const close = sinon.spy();
    sinon.stub(puppeteer, 'launch').resolves({ close: close, on: () => {} });
    r.close();

    assert.notEqual(close.called, true); // Not close if not launched

    await r.browserAsync();
    await r.close();

    assert(close.called); // Closed if launched
  });

  it('isHTML', () => {
    assert.equal(renderer.isHTML(res), false);
    assert.equal(renderer.isHTML(resHtml), true);
  });

  it('renders false if res is not html', async () => {
    const r = new Renderer(
      {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      },
      {
        cacheKey: url => url
      }
    );
    r.isHTML = () => false;

    const res = await r.render('about:blank');
    assert.equal(res, false);
    await r.close();
  });
});
