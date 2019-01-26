const puppeteer = require('puppeteer');
const http = require('http');
const { JSDOM } = require('jsdom');
const Cache = require('cache-manager');
const nodeFetch = require('node-fetch');
const footer = '<!-- Server side rendering powered by @sifrr/seo -->';
const isHeadless = new RegExp('headless');

const defaultCache = (ops) => Cache.caching({
  store: 'memory',
  ttl: ops.ttl,
  length: (val, key) => {
    return Buffer.from(2 * key + val).length + 2;
  },
  max: ops.maxCacheSize * 1000000
});

class SifrrSeo {
  /* istanbul ignore next */
  static onRenderJS() {
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

  fullUrl(req) {
    return `http://127.0.0.1:${this.options.localport}${req.originalUrl}`;
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
      ttl: 0,
      cacheKey: (req) => this.fullUrl(req),
      localport: 80
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

        const key = this.options.cacheKey(req);
        req.sifrrCacheKey = key;
        req.sifrrUrl = this.fullUrl(req);

        if (this.shouldRenderCache[key] === false) {
          if (next) next();
        } else {
          this.renderedCache.get(key, (err, val) => {
            if (err || !val) {
              this.render(req, next).then((resp) => {
                if (resp) res.send(resp);
                else next();
              });
            } else res.send(val);
          });
        }
      } else {
        if (next) next();
      }
    }
    return mw.bind(this);
  }

  isHeadless(req) {
    const ua = req.get('User-Agent');
    return !!isHeadless.test(ua);
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

  async render(req, next) {
    const fullUrl = req.sifrrUrl;
    let pro = Promise.resolve(true);
    const me = this;
    const headers = req.headers;
    delete headers['user-agent'];
    const httpHeaders = Object.assign({ 'user-agent': 'headless' }, headers);

    http.get(fullUrl, { headers: httpHeaders }, (res) => {
      const sRC = me.isHtml(res);
      if (sRC) {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          const dom = new JSDOM(body, {
            url: fullUrl,
            referrer: fullUrl,
            resources: 'usable',
            runScripts: 'dangerously',
            userAgent: 'headless',
            beforeParse(window) {
              window.fetch = (url, options) => {
                if (url.indexOf('http') !== 0) url = `http://127.0.0.1:${me.options.localport}${url}`;
                return nodeFetch(url, options);
              };
            }
          });
          console.log(dom.serialize());
        });
      }
    });

    if (!this.launched) pro = this.launchBrowser();
    return pro.then(() => this.browser.newPage()).then(async (newp) => {
      await newp.setExtraHTTPHeaders(headers);
      const resp = await newp.goto(fullUrl, { waitUntil: 'networkidle0' });
      const sRC = me.isHTML(resp);
      let ret;

      if (sRC) {
        process.stdout.write(`Rendering ${fullUrl} with sifrr-seo \n`);
        /* istanbul ignore next */
        await newp.evaluate(this.constructor.onRenderJS);

        /* istanbul ignore next */
        const resp = await newp.evaluate(() => new XMLSerializer().serializeToString(document)) + footer;
        me.renderedCache.set(req.sifrrCacheKey, resp, (err) => {
          if (err) throw err;
        });
        ret = resp;
      } else {
        ret = false;
      }

      me.shouldRenderCache[req.sifrrCacheKey] = sRC;
      newp.close();
      return ret;
    }).catch(e => {
      if (next) next(e);
    });
  }

  isHTML(puppeteerResp) {
    return !!(puppeteerResp.headers()['content-type'] && puppeteerResp.headers()['content-type'].indexOf('html') >= 0);
  }

  isHtml(resp) {
    return !!(resp.headers['content-type'] && resp.headers['content-type'].indexOf('html') >= 0);
  }
}

module.exports = SifrrSeo;
