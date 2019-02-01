const { noop } = require('./constants');
const puppeteer = require('puppeteer');
const Cache = require('cache-manager');
const PageRequest = require('./pagerequest');

const getCache = (ops) => Cache.caching({
  store: ops.cacheStore,
  ttl: ops.ttl,
  length: (val, key) => {
    return Buffer.from(key + key + val).length + 2;
  },
  max: ops.maxCacheSize * 1000000
});

class Renderer {
  constructor(puppeteerOptions = {}, options = {}) {
    this.launched = false;
    this.puppeteerOptions = Object.assign({
      headless: process.env.HEADLESS !== 'false',
      args: [],
    }, puppeteerOptions);
    this.puppeteerOptions.args.push(
      '--no-sandbox',
      '--disable-setuid-sandbox'
    );
    this.options = Object.assign({
      cache: 'memory',
      maxCacheSize: 100,
      ttl: 0,
      cacheKey: (req) => req.fullUrl,
      fullUrl: (expressReq) => `http://127.0.0.1:80${expressReq.originalUrl}`,
      beforeRender: noop,
      afterRender: noop
    }, options);
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
    if (this.launched) return this.browser.close();
    else return Promise.resolve(true);
  }

  render(req) {
    const key = this.options.cacheKey(req);
    return new Promise((res, rej) => {
      if (this.shouldRenderCache[key] === false) {
        res(false);
      } else {
        this.cache.get(key, (err, val) => {
          /* istanbul ignore if */
          if (err) {
            rej(err);
          } else if (!val) {
            this.renderOnPuppeteer(req).then((resp) => {
              res(resp);
            }).catch(err => {
              /* istanbul ignore next */
              rej(err);
            });
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
        const resp = await newp.evaluate(() => new XMLSerializer().serializeToString(document));
        me.cache.set(key, resp, (err) => {
          /* istanbul ignore next */
          if (err) throw err;
        });
        ret = resp;
      } else {
        ret = false;
      }

      me.shouldRenderCache[key] = sRC;
      await newp.close();
      return ret;
    });
  }

  addShouldRenderCache(req, val) {
    const key = this.options.cacheKey(req);
    this.shouldRenderCache[key] = val;
  }

  getShouldRenderCache(req) {
    const key = this.options.cacheKey(req);
    if (this.shouldRenderCache[key] === undefined) return null;
    return this.shouldRenderCache[key];
  }

  isHTML(puppeteerResp) {
    return !!(puppeteerResp.headers()['content-type'] && puppeteerResp.headers()['content-type'].indexOf('html') >= 0);
  }
}

module.exports = Renderer;
