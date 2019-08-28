const puppeteer = require('puppeteer');
const PageRequest = require('./pagerequest');
// status
// 0: closed
// 1: launching
// 2: launched

const prohibitedHeaders = ['user-agent', 'host'];
class Renderer {
  constructor(puppeteerOptions = {}, options = {}) {
    this.status = 0;
    this.puppeteerOptions = Object.assign(
      {
        headless: true,
        args: []
      },
      puppeteerOptions
    );
    this.puppeteerOptions.args.push('--no-sandbox', '--disable-setuid-sandbox');
    this.options = options;
  }

  async browserAsync() {
    if (!this._browser) {
      this._browser = puppeteer.launch(this.puppeteerOptions).then(b => {
        b.on('disconnected', () => {
          /* istanbul ignore next */
          this._browser = null;
        });
        return b;
      });
    }
    return this._browser;
  }

  close() {
    if (this._browser) return this.browserAsync().then(b => b.close());
    else return Promise.resolve(true);
  }

  render(url, headers = {}) {
    const me = this;

    return this.browserAsync()
      .then(b => b.newPage())
      .then(async newp => {
        const fetches = new PageRequest(newp, me.options.filterOutgoingRequests);
        await fetches.addListener;

        prohibitedHeaders.forEach(h => delete headers[h]);

        await newp.setExtraHTTPHeaders(headers);
        if (me.options.beforeRender) {
          /* istanbul ignore next */
          await newp.evaluateOnNewDocument(me.options.beforeRender).catch(console.error);
        }
        const resp = await newp.goto(url, { waitUntil: 'load' });
        const sRC = me.isHTML(resp);
        let ret;

        if (sRC) {
          await fetches.all();
          if (me.options.afterRender) {
            /* istanbul ignore next */
            await newp.evaluate(me.options.afterRender).catch(console.error);
          }
          ret = await newp.content();
        } else ret = false;

        await newp.close();
        return ret;
      });
  }

  isHTML(puppeteerResp) {
    return (
      puppeteerResp.headers()['content-type'] &&
      puppeteerResp.headers()['content-type'].indexOf('html') >= 0
    );
  }
}

module.exports = Renderer;
