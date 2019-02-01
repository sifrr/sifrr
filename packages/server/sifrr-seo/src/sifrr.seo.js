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
    this.options = options;
  }

  get middleware() {
    function mw(req, res, next) {
      // Don't render other requests than GET
      if (req.method !== 'GET') return next();

      const renderReq = {
        fullUrl: this.renderer.options.fullUrl(req),
        headers: req.headers
      };

      if (this.renderer.getShouldRenderCache(renderReq) === null) {
        res._end = res.end;
        res.end = (resp, encoding) => {
          if (res.hasHeader('content-type')) {
            const contentType = res.getHeader('content-type');
            if (contentType.indexOf('html') >= 0) {
              this.renderer.addShouldRenderCache(renderReq, true);
            } else {
              this.renderer.addShouldRenderCache(renderReq, false);
            }
          }
          res._end(resp, encoding);
        };
      }

      return this.render(renderReq).then((html) => {
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
    this.renderer.cache.reset();
  }

  close() {
    return this.renderer.close();
  }

  setPuppeteerOption(name, value) {
    this._poptions = this._poptions || {};
    this._poptions[name] = value;
  }

  async render(req) {
    if (this.shouldRender(req) && !this.isHeadless(req) && !this.hasReferer(req)) {
      return this.renderer.render(req);
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
