const puppeteer = require('puppeteer');
const PageRequest = require('./pagerequest');
// status
// 0: closed
// 1: launching
// 2: launched

class Renderer {
  constructor(puppeteerOptions = {}, options = {}) {
    this.status = 0;
    this.puppeteerOptions = Object.assign({
      headless: true,
      args: [],
    }, puppeteerOptions);
    this.puppeteerOptions.args.push(
      '--no-sandbox',
      '--disable-setuid-sandbox'
    );
    this.options = options;
  }

  async browserAsync() {
    const me = this;
    if (this.status === 0) {
      this.status = 1;
      this._browser = puppeteer.launch(this.puppeteerOptions).then(b => {
        this.status = 2;
        me.browser = b;
        b.on('disconnected', () => {
          /* istanbul ignore next */
          me.status = 0;
        });
        return b;
      });
    }
    return this._browser;
  }

  close() {
    if (this.status === 2) return this.browser.close();
    else if (this.status === 1) return this._browser.then(b => b.close());
    else return Promise.resolve(true);
  }

  render(req) {
    const fullUrl = req.fullUrl;
    const me = this;

    return this.browserAsync().then(() => this.browser.newPage()).then(async (newp) => {
      const fetches = new PageRequest(newp, me.options.filterOutgoingRequests);
      await fetches.addListener;

      const headers = req.headers || {};
      delete headers['user-agent'];
      await newp.setExtraHTTPHeaders(headers);
      if (me.options.beforeRender) await newp.evaluateOnNewDocument(me.options.beforeRender);
      const resp = await newp.goto(fullUrl, { waitUntil: 'load' });
      const sRC = me.isHTML(resp);
      let ret;

      if (sRC) {
        await fetches.all();
        /* istanbul ignore next */
        if (me.options.afterRender) await newp.evaluate(me.options.afterRender);
        /* istanbul ignore next */
        ret = await newp.content();
      } else ret = false;

      await newp.close();
      return ret;
    });
  }

  isHTML(puppeteerResp) {
    return (puppeteerResp.headers()['content-type'] && puppeteerResp.headers()['content-type'].indexOf('html') >= 0);
  }
}

module.exports = Renderer;
