const { noop } = require('./constants');
const Renderer = require('./renderer');
const footer = '<!-- Server side rendering powered by @sifrr/seo -->';
const isHeadless = new RegExp('headless');

class SifrrSeo {
  constructor(userAgents = [
    'Googlebot', // Google
    'Bingbot', // Bing
    'Slurp', // Slurp
    'DuckDuckBot', // DuckDuckGo
    'Baiduspider', //Baidu
    'YandexBot', // Yandex
    'Sogou', // Sogou
    'Exabot', // Exalead
  ], options = {}) {
    this._uas = userAgents.map((ua) => new RegExp(ua));
    this.options = Object.assign({
      cache: false,
      maxCacheSize: 100,
      ttl: 0,
      cacheKey: (req) => this.fullUrl(req),
      localport: 80,
      onRender: noop
    }, options);
  }

  get middleware() {
    function mw(req, res, next) {
      // Don't render other requests than GET
      if (req.method !== 'GET') return next();

      if (this.shouldRender(req) && !this.isHeadless(req) && !this.hasReferer(req)) {
        this.render(req).then((html) => {
          if (html) res.send(html + footer);
          else next();
        }).catch((e) => {
          next(e);
        });
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
    this.renderer.cache.flushAll();
  }

  close() {
    this.renderer.close();
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

  render(req, next) {
    return this.renderer.render(req, next);
  }

  get renderer() {
    this._renderer = this._renderer || new Renderer(this.puppeteerOptions, this.options);
    return this._renderer;
  }
}

module.exports = SifrrSeo;
