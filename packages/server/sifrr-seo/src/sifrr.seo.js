const puppeteer = require('puppeteer');
const Cache = require('cache-manager');

const defaultCache = (ops) => Cache.caching({
  store: 'memory',
  ttl: ops.ttl,
  length: (val, key) => {
    return Buffer.from(2 * key + val).length + 2;
  },
  max: ops.maxCacheSize * 1000000
});

class SifrrSeo {
  static flatteningJS() {
    if (typeof Sifrr === 'undefined' || typeof Sifrr.Dom === 'undefined') return false;
    const defined = Object.keys(Sifrr.Dom.elements);
    defined.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (el.shadowRoot) el.appendChild(el.shadowRoot);
      });
    });
    return true;
  }

  constructor(userAgents = [
    'Googlebot', // Google
    'Bingbot', // Bing
    'Slurp', // Slurp
    'DuckDuckBot', // DuckDuckGo
    'Baiduspider', //Baidu
    'YandexBot', // Yandex
    'Sogou', // Sogou
    'Exabot', // Exalead
  ], options) {
    this._uas = userAgents.map((ua) => new RegExp(ua));
    this.launched = false;
    this.shouldRenderCache = {};
    this.options = Object.assign({
      cache: false,
      maxCacheSize: 100,
      ttl: 0
    }, options);
    if (!this.options.cache) {
      this.renderedCache = defaultCache(this.options);
    } else this.renderedCache = this.options.cache;
  }

  get middleware() {
    function mw(req, res, next) {
      // Don't render other requests than GET
      if (req.method !== 'GET') return next();

      if (this.shouldRender(req) && !this.isHeadless(req) && !this.hasReferer(req)) {

        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

        if (this.shouldRenderCache[fullUrl] === false) {
          next();
        } else {
          this.renderedCache.get(fullUrl, (err, val) => {
            if (err || !val) {
              this.render(fullUrl).then((resp) => {
                if (resp) res.send(resp);
                else next();
              });
            } else res.send(val);
          });
        }
      } else {
        next();
      }
    }
    return mw.bind(this);
  }

  isHeadless(req) {
    const ua = req.get('User-Agent');
    if (new RegExp('headless').test(ua)) {
      return true;
    }
    return false;
  }

  hasReferer(req) {
    const ref = req.get('Referer');
    return !!ref;
  }

  shouldRender(req) {
    return this.isUserAgent(req);
  }

  isUserAgent(req) {
    const ua = req.get('User-Agent');
    let ret = false;
    this._uas.forEach((b) => {
      if (b.test(ua)) ret = true;
    });
    return ret;
  }

  addUserAgent(userAgent) {
    this._uas.push(new RegExp(userAgent));
  }

  clearCache() {
    this.shouldRenderCache = {};
    this.renderedCache.flushAll();
  }

  close() {
    this.browser.close();
  }

  async launchBrowser() {
    this.browser = await puppeteer.launch(this.puppeteerOptions);
    this.launched = true;
    const me = this;
    this.browser.on('disconnected', () => {
      me.launched = false;
    });
  }

  setPuppeteerOption(name, value) {
    this._poptions = this._poptions || {};
    this._poptions[name] = value;
  }

  get puppeteerOptions() {
    const newOpts = Object.assign({
      headless: process.env.HEADLESS !== 'false',
      devtools: process.env.HEADLESS !== 'false',
      args: [],
    }, this._poptions || {});
    newOpts.args.push(
      '--no-sandbox',
      '--disable-setuid-sandbox'
    );
    return newOpts;
  }

  async render(fullUrl) {
    let pro = Promise.resolve(true);
    const me = this;
    if (!this.launched) pro = this.launchBrowser();
    return pro.then(() => this.browser.newPage()).then(async (newp) => {
      const resp = await newp.goto(fullUrl, { waitUntil: 'networkidle0' });
      const sRC = me.isHTML(resp);
      let ret;

      if (sRC) {
        process.stdout.write(`Rendering ${fullUrl} with sifrr-seo \n`);
        await newp.evaluate(this.constructor.flatteningJS);
        const resp = await newp.evaluate(() => new XMLSerializer().serializeToString(document));
        me.renderedCache.set(fullUrl, resp, (err) => {
          if (err) throw err;
        });
        ret = resp;
      } else {
        ret = false;
      }

      me.shouldRenderCache[fullUrl] = sRC;
      newp.close();
      return ret;
    }).catch(e => {
      throw e;
    });
  }

  isHTML(resp) {
    return !!(resp.headers()['content-type'] && resp.headers()['content-type'].indexOf('html') >= 0);
  }
}

module.exports = SifrrSeo;
