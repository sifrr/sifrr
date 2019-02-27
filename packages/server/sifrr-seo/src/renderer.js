const puppeteer = require('puppeteer');
const PageRequest = require('./pagerequest');
const { noop } = require('./constants');

class Renderer {
  constructor(puppeteerOptions = {}, options = {}) {
    this.launched = false;
    this.puppeteerOptions = Object.assign({
      headless: true,
      args: [],
    }, puppeteerOptions);
    this.puppeteerOptions.args.push(
      '--no-sandbox',
      '--disable-setuid-sandbox'
    );
    this.options = Object.assign({
      beforeRender: noop,
      afterRender: noop
    }, options);
  }

  async launchBrowser() {
    this.browser = await puppeteer.launch(this.puppeteerOptions);
    this.launched = true;
    const me = this;
    this.browser.on('disconnected', () => {
      /* istanbul ignore next */
      me.launched = false;
    });
  }

  close() {
    if (this.launched) return this.browser.close();
    else return Promise.resolve(true);
  }

  render(req) {
    const fullUrl = req.fullUrl;
    let pro = Promise.resolve(true);
    const me = this;

    if (!this.launched) pro = this.launchBrowser();
    return pro.then(() => this.browser.newPage()).then(async (newp) => {
      const fetches = new PageRequest(newp);

      const headers = req.headers || {};
      delete headers['user-agent'];
      await newp.setExtraHTTPHeaders(headers);
      await newp.evaluateOnNewDocument(me.options.beforeRender);
      const resp = await newp.goto(fullUrl, { waitUntil: 'load' });
      const sRC = me.isHTML(resp);
      let ret;

      if (sRC) {
        await fetches.all();
        process.stdout.write(`Rendering ${fullUrl} with sifrr-seo \n`);
        /* istanbul ignore next */
        await newp.evaluate(me.options.afterRender);
        /* istanbul ignore next */
        ret = await newp.evaluate(() => new XMLSerializer().serializeToString(document));
      } else {
        ret = false;
      }

      await newp.close();
      return ret;
    });
  }

  isHTML(puppeteerResp) {
    return (puppeteerResp.headers()['content-type'] && puppeteerResp.headers()['content-type'].indexOf('html') >= 0);
  }
}

module.exports = Renderer;
