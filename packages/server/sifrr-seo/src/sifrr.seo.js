const Renderer = require('./renderer');
const isHeadless = new RegExp('(headless|Headless)');
const getCache = require('./getcache');

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
    this.shouldRenderCache = {};
    this.options = Object.assign({
      cacheKey: (req) => req.fullUrl,
      fullUrl: (expressReq) => `http://127.0.0.1:80${expressReq.originalUrl}`
    }, options);
  }

  get middleware() {
    return require('./middleware').bind(this);
  }

  isHeadless(req) {
    const ua = req.headers['user-agent'];
    return !!isHeadless.test(ua);
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
    this.cache.reset();
  }

  close() {
    return this.renderer.close();
  }

  setPuppeteerOption(name, value) {
    this._poptions = this._poptions || {};
    this._poptions[name] = value;
  }

  get cache() {
    this._cache = this._cache || getCache(this.options);
    return this._cache;
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

  async render(req) {
    if (this.getShouldRenderCache(req) === false) {
      throw Error(`No Render`);
    } else if (this.shouldRender(req) && !this.isHeadless(req)) {
      const key = this.options.cacheKey(req);
      return new Promise((res, rej) => {
        this.cache.get(key, (err, val) => {
          /* istanbul ignore if */
          if (err) {
            rej(err);
          } else if (!val) {
            this.renderer.render(req).then((resp) => {
              this.cache.set(key, resp);
              res(resp);
            }).catch(/* istanbul ignore next */ err => {
              rej(err);
            });
          } else {
            res(val);
          }
        });
      });
    } else {
      throw Error(`No Render`);
    }
  }

  get renderer() {
    this._renderer = this._renderer || new SifrrSeo.Renderer(this._poptions, this.options);
    return this._renderer;
  }
}

SifrrSeo.Renderer = Renderer;

module.exports = SifrrSeo;
