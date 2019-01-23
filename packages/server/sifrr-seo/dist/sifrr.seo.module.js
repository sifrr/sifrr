/*! Sifrr.Seo v0.0.2-alpha - sifrr project */
import puppeteer from 'puppeteer';

class SifrrSeo {
  static flatteningJS() {
    if (typeof Sifrr === 'undefined' || typeof Sifrr.Dom === 'undefined') return false;
    const defined = Object.keys(Sifrr.Dom.elements);
    defined.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.shadowRoot) el.appendChild(el.shadowRoot);
      });
    });
    return true;
  }

  constructor(userAgents = ['Googlebot', // Google
  'Bingbot', // Bing
  'Slurp', // Slurp
  'DuckDuckBot', // DuckDuckGo
  'Baiduspider', //Baidu
  'YandexBot', // Yandex
  'Sogou', // Sogou
  'Exabot']) {
    this._uas = userAgents.map(ua => new RegExp(ua));
    this.launched = false;
    this.shouldRenderCache = {};
    this.renderedCache = {};
  }

  get middleware() {
    function mw(req, res, next) {
      if (this.shouldRender(req)) {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

        if (this.shouldRenderCache[fullUrl] === false) {
          next();
        } else {
          if (this.shouldRenderCache[fullUrl] && typeof this.renderedCache[fullUrl] === 'string') {
            res.send(this.renderedCache[fullUrl]);
          } else {
            this.render(fullUrl).then(resp => {
              if (resp) res.send(resp);else next();
            });
          }
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

  shouldRender(req) {
    return this.isUserAgent(req);
  }

  isUserAgent(req) {
    const ua = req.get('User-Agent');
    let ret = false;

    this._uas.forEach(b => {
      if (b.test(ua)) ret = true;
    });

    return ret;
  }

  addUserAgent(userAgent) {
    this._uas.push(new RegExp(userAgent));
  }

  clearCache() {
    this.shouldRenderCache = {};
    this.renderedCache = {};
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
      args: []
    }, this._poptions || {});
    newOpts.args.push('--no-sandbox', '--disable-setuid-sandbox');
    return newOpts;
  }

  async render(fullUrl) {
    let pro = Promise.resolve(true);
    const me = this;
    if (!this.launched) pro = this.launchBrowser();
    return pro.then(() => this.browser.newPage()).then(async newp => {
      const resp = await newp.goto(fullUrl, {
        waitUntil: 'networkidle0'
      });
      const sRC = !!(resp.headers()['content-type'] && resp.headers()['content-type'].indexOf('html') >= 0);
      let ret;

      if (sRC) {
        process.stdout.write(`Rendering ${fullUrl} with sifrr-seo \n`);
        await newp.evaluate(this.constructor.flatteningJS);
        const resp = await newp.evaluate(() => new XMLSerializer().serializeToString(document));
        me.renderedCache[fullUrl] = resp;
        ret = resp;
      } else {
        ret = false;
      }

      me.shouldRenderCache[fullUrl] = sRC;
      newp.close();
      return ret;
    }).catch(e => {
      process.stderr.write(e.message);
    });
  }

}

var sifrr_seo = SifrrSeo;

export default sifrr_seo;
/*! (c) @aadityataparia */
