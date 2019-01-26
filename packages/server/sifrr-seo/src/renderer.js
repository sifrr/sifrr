const puppeteer = require('puppeteer');
const Cache = require('cache-manager');
const pageRequest = require('./pagerequest');

const defaultCache = (ops) => Cache.caching({
  store: 'memory',
  ttl: ops.ttl,
  length: (val, key) => {
    return Buffer.from(2 * key + val).length + 2;
  },
  max: ops.maxCacheSize * 1000000
});

class Renderer {
  constructor(puppeteerOptions, options) {
    this.launched = false;
    this.puppeteerOptions = puppeteerOptions;
    this.options = options;
    if (!this.options.cache) {
      this.cache = defaultCache(this.options);
    } else this.cache = this.options.cache;
    this.shouldRenderCache = {};
  }

  async launchBrowser() {
    this.browser = await puppeteer.launch(this.puppeteerOptions);
    this.launched = true;
    const me = this;
    this.browser.on('disconnected', () => {
      me.launched = false;
    });
  }

  close() {
    if (this.launched) this.browser.close();
  }

  render(req) {
    const key = this.options.cacheKey(req);
    return new Promise((res, rej) => {
      if (this.shouldRenderCache[key] === false) {
        res(false);
      } else {
        this.cache.get(key, (err, val) => {
          if (err) {
            rej(err);
          } else if (!val) {
            this.renderOnPuppeteer(req).then((resp) => {
              res(resp);
            }).catch(err => rej(err));
          } else {
            res(val);
          }
        });
      }
    });
  }

  renderOnPuppeteer(req) {
    const key = this.options.cacheKey(req);
    const fullUrl = this.fullUrl(req);
    let pro = Promise.resolve(true);
    const me = this;

    if (!this.launched) pro = this.launchBrowser();
    return pro.then(() => this.browser.newPage()).then(async (newp) => {
      await pageRequest(newp);

      const headers = req.headers;
      delete headers['user-agent'];
      await newp.setExtraHTTPHeaders(headers);
      const resp = await newp.goto(fullUrl, { waitUntil: 'load' });
      const sRC = me.isHTML(resp);
      let ret;

      if (sRC) {
        await newp.allFetchComplete();
        process.stdout.write(`Rendering ${fullUrl} with sifrr-seo \n`);
        /* istanbul ignore next */
        await newp.evaluate(me.options.onRender);

        /* istanbul ignore next */
        const resp = await newp.evaluate(() => new XMLSerializer().serializeToString(document));
        me.cache.set(key, resp, (err) => {
          if (err) throw err;
        });
        ret = resp;
      } else {
        ret = false;
      }

      me.shouldRenderCache[key] = sRC;
      newp.close();
      return ret;
    });
  }

  fullUrl(req) {
    return `http://127.0.0.1:${this.options.localport}${req.originalUrl}`;
  }

  isHTML(puppeteerResp) {
    return !!(puppeteerResp.headers()['content-type'] && puppeteerResp.headers()['content-type'].indexOf('html') >= 0);
  }
}

module.exports = Renderer;
