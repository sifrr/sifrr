const puppeteer = require('puppeteer');
const Cache = require('cache-manager');
const PageRequest = require('./pagerequest');

const getCache = (ops) => Cache.caching({
  store: ops.cacheStore,
  ttl: ops.ttl || 0,
  length: (val, key) => {
    return Buffer.from(key + val).length + 2;
  },
  max: (ops.maxCacheSize || 0) * 1000000
});

class Renderer {
  constructor(puppeteerOptions = {}, options = {}) {
    this.launched = false;
    this.puppeteerOptions = puppeteerOptions;
    this.options = options;
    this.cache = getCache(this.options);
    this.shouldRenderCache = {};
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
            /* istanbul ignore next */
            rej(err);
          } else if (!val) {
            this.renderOnPuppeteer(req).then((resp) => {
              res(resp);
            /* istanbul ignore next */
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
    const fullUrl = req.fullUrl;
    let pro = Promise.resolve(true);
    const me = this;

    if (!this.launched) pro = this.launchBrowser();
    return pro.then(() => this.browser.newPage()).then(async (newp) => {
      const fetches = new PageRequest(newp);

      const headers = req.headers;
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

  isHTML(puppeteerResp) {
    return !!(puppeteerResp.headers()['content-type'] && puppeteerResp.headers()['content-type'].indexOf('html') >= 0);
  }
}

module.exports = Renderer;
