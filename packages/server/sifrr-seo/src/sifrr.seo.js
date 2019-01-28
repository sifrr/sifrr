const { noop } = require('./constants');
const Renderer = require('./renderer');
const footer = '<!-- Server side rendering powered by @sifrr/seo -->';
const isHeadless = new RegExp('(headless|Headless)');

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
      cache: 'memory',
      maxCacheSize: 100,
      ttl: 0,
      cacheKey: (req) => req.fullUrl,
      fullUrl: (expressReq) => `http://127.0.0.1:80${expressReq.originalUrl}`,
      beforeRender: noop,
      afterRender: noop
    }, options);
  }

  get middleware() {
    function mw(req, res, next) {
      // Don't render other requests than GET
      if (req.method !== 'GET') return next();

      const renderReq = {
        fullUrl: this.options.fullUrl(req),
        headers: req.headers
      };

      this.render(renderReq).then((html) => {
        if (html) res.send(html + footer);
        else next();
      }).catch((e) => {
        process.stdout.write(e);
        next();
      });
    }
    return mw.bind(this);
  }

  isHeadless(req) {
    const ua = req.headers['user-agent'];
    return !!isHeadless.test(ua);
  }

  hasReferer(req) {
    const ref = req.headers['referer'];
    return !!ref;
  }

  shouldRender(req) {
    return this.isUserAgent(req);
  }

  isUserAgent(req) {
    const ua = req.headers['user-agent'];
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

  async render(req) {
    if (this.shouldRender(req) && !this.isHeadless(req) && !this.hasReferer(req)) {
      return this.renderer.render(req);
    } else {
      throw Error(`No Render`);
    }
  }

  get renderer() {
    this._renderer = this._renderer || new Renderer(this.puppeteerOptions, this.options);
    return this._renderer;
  }
}

SifrrSeo.Renderer = Renderer;

module.exports = SifrrSeo;
