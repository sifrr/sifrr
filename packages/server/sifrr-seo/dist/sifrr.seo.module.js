/*! Sifrr.Seo v0.0.5 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import puppeteer from 'puppeteer';
import cacheManager from 'cache-manager';

const whiteTypes = ['document', 'script', 'xhr', 'fetch'];
function isTypeOf(request, types) {
  const resType = request.resourceType();
  return types.indexOf(resType) !== -1;
}
class PageRequest {
  constructor(npage, filter = () => true) {
    this.npage = npage;
    this.filter = filter;
    this.pendingRequests = 0;
    this.pendingPromise = new Promise(res => (this.pendingResolver = res));
    this.addOnRequestListener();
    this.addEndRequestListener();
  }
  addOnRequestListener() {
    const me = this;
    this.addListener = this.npage.setRequestInterception(true).then(() => {
      me.npage.on('request', request => {
        if (isTypeOf(request, whiteTypes) && this.filter(request.url())) {
          me.pendingRequests++;
          request.__allowed = true;
          request.continue();
        } else {
          request.__allowed = false;
          request.abort();
        }
      });
    });
  }
  addEndRequestListener() {
    const me = this;
    this.npage.on('requestfailed', request => {
      me.onEnd(request);
    });
    this.npage.on('requestfinished', request => {
      me.onEnd(request);
    });
  }
  onEnd(request) {
    if (request.__allowed) {
      this.pendingRequests--;
      if (this.pendingRequests === 0) this.pendingResolver();
    }
  }
  all() {
    if (this.pendingRequests === 0) return Promise.resolve(true);
    return this.pendingPromise;
  }
}
var pagerequest = PageRequest;

class Renderer {
  constructor(puppeteerOptions = {}, options = {}) {
    this.status = 0;
    this.puppeteerOptions = Object.assign(
      {
        headless: true,
        args: []
      },
      puppeteerOptions
    );
    this.puppeteerOptions.args.push('--no-sandbox', '--disable-setuid-sandbox');
    this.options = options;
  }
  async browserAsync() {
    if (!this._browser) {
      this._browser = puppeteer.launch(this.puppeteerOptions).then(b => {
        b.on('disconnected', () => {
          this._browser = null;
        });
        return b;
      });
    }
    return this._browser;
  }
  close() {
    if (this._browser) return this.browserAsync().then(b => b.close());
    else return Promise.resolve(true);
  }
  render(url, headers = {}) {
    const me = this;
    return this.browserAsync()
      .then(b => b.newPage())
      .then(async newp => {
        const fetches = new pagerequest(newp, me.options.filterOutgoingRequests);
        await fetches.addListener;
        delete headers['user-agent'];
        await newp.setExtraHTTPHeaders(headers);
        if (me.options.beforeRender) await newp.evaluateOnNewDocument(me.options.beforeRender);
        const resp = await newp.goto(url, { waitUntil: 'load' });
        const sRC = me.isHTML(resp);
        let ret;
        if (sRC) {
          await fetches.all();
          if (me.options.afterRender) await newp.evaluate(me.options.afterRender);
          ret = await newp.content();
        } else ret = false;
        await newp.close();
        return ret;
      });
  }
  isHTML(puppeteerResp) {
    return (
      puppeteerResp.headers()['content-type'] &&
      puppeteerResp.headers()['content-type'].indexOf('html') >= 0
    );
  }
}
var renderer = Renderer;

var getcache = ops => {
  ops = Object.assign(
    {
      cacheStore: 'memory',
      maxCacheSize: 100,
      ttl: 0
    },
    ops
  );
  return cacheManager.caching({
    store: ops.cacheStore,
    ttl: ops.ttl,
    length: (val, key) => {
      return Buffer.from(key + key + val).length + 2;
    },
    max: ops.maxCacheSize * 1000000
  });
};

var constants = {
  noop: () => {},
  headerName: 'X-SSR-Powered-By',
  headerValue: '@sifrr/seo'
};

const { headerName, headerValue } = constants;
var middleware = getUrl => {
  return function(req, res, next) {
    if (req.method !== 'GET') return next();
    const url = getUrl(req);
    const headers = req.headers;
    if (this.getShouldRenderCache(url, headers) === null) {
      res._end = res.end;
      res.end = (resp, encoding) => {
        if (res.hasHeader('content-type')) {
          const contentType = res.getHeader('content-type');
          if (contentType.indexOf('html') >= 0) {
            this.setShouldRenderCache(url, headers, true);
          } else {
            this.setShouldRenderCache(url, headers, false);
          }
        }
        res._end(resp, encoding);
      };
    }
    return this.render(url, headers)
      .then(html => {
        if (html) {
          res.set(headerName, headerValue);
          res.send(html);
        } else {
          next();
        }
      })
      .catch(e => {
        if (e.message === 'No Render') {
          next();
        } else next(e);
      });
  };
};

const isHeadless = new RegExp('(headless|Headless)');
class SifrrSeo {
  constructor(
    userAgents = [
      'Googlebot',
      'Bingbot',
      'Slurp',
      'DuckDuckBot',
      'Baiduspider',
      'YandexBot',
      'Sogou',
      'Exabot'
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
    this._cache = this._cache || getcache(this.options);
    return this._cache;
  }
  getExpressMiddleware(getUrl = expressReq => `http://127.0.0.1:80${expressReq.originalUrl}`) {
    return middleware(getUrl).bind(this);
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
                 err => {
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
SifrrSeo.Renderer = renderer;
var sifrr_seo = SifrrSeo;

export default sifrr_seo;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.seo.module.js.map
