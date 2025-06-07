const Renderer = require('./renderer');
const isHeadless = new RegExp('(headless|Headless)');
const getCache = require('./getcache');

class SifrrSeo {
  constructor(
    userAgents = [
      'Googlebot', // Google
      'Bingbot', // Bing
      'Slurp', // Slurp
      'DuckDuckBot', // DuckDuckGo
      'Baiduspider', //Baidu
      'YandexBot', // Yandex
      'Sogou', // Sogou
      'Exabot' // Exalead
    ],
    options = {}
  ) {
    this._uas = userAgents.map(ua => new RegExp(ua));
    this.shouldRenderCache = {};
    this.options = Object.assign(
      {
        cacheKey: url => url
      },
      options
    );
  }

  get renderer() {
    this._renderer = this._renderer || new SifrrSeo.Renderer(this._poptions, this.options);
    return this._renderer;
  }

  get cache() {
    this._cache = this._cache || getCache(this.options);
    return this._cache;
  }

  getExpressMiddleware(getUrl = expressReq => `http://127.0.0.1:80${expressReq.originalUrl}`) {
    return require('./middleware')(getUrl).bind(this);
  }

  addUserAgent(userAgent) {
    this._uas.push(new RegExp(userAgent));
  }

  setPuppeteerOption(name, value) {
    this._poptions = this._poptions || {};
    this._poptions[name] = value;
  }

  close() {
    return this.renderer.close();
  }

  shouldRender(url, headers) {
    return this._isUserAgent(headers);
  }

  setShouldRenderCache(url, headers, val) {
    const key = this.options.cacheKey(url, headers);
    this.shouldRenderCache[key] = val;
  }

  getShouldRenderCache(url, headers) {
    const key = this.options.cacheKey(url, headers);
    if (this.shouldRenderCache[key] === undefined) return null;
    return this.shouldRenderCache[key];
  }

  clearCache() {
    this.cache.reset();
  }

  async render(url, headers) {
    if (this.getShouldRenderCache(url, headers) === false) {
      throw Error(`No Render`);
    } else if (this.shouldRender(url, headers) && !this._isHeadless(headers)) {
      const key = this.options.cacheKey(url, headers);
      return new Promise((res, rej) => {
        this.cache.get(key, (err, val) => {
          /* istanbul ignore if */
          if (err) {
            rej(err);
          } else if (!val) {
            this.renderer
              .render(url, headers)
              .then(resp => {
                this.cache.set(key, resp);
                res(resp);
              })
              .catch(
                /* istanbul ignore next */ err => {
                  rej(err);
                }
              );
          } else {
            res(val);
          }
        });
      });
    } else {
      throw Error(`No Render`);
    }
  }

  _isHeadless(headers = {}) {
    return !!isHeadless.test(headers['user-agent']);
  }

  _isUserAgent(headers = {}) {
    const ua = headers['user-agent'];
    let ret = false;
    this._uas.forEach(b => {
      if (b.test(ua)) ret = true;
    });
    return ret;
  }
}

SifrrSeo.Renderer = Renderer;

module.exports = SifrrSeo;
