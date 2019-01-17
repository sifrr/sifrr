const puppeteer = require('puppeteer');

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

  constructor(botUserAgents = [
    'Googlebot', // Google
    'Bingbot', // Bing
    'Slurp', // Slurp
    'DuckDuckBot', // DuckDuckGo
    'Baiduspider', //Baidu
    'YandexBot', // Yandex
    'Sogou', // Sogou
    'Exabot', // Exalead
  ]) {
    this._bots = botUserAgents.map((ua) => new RegExp(ua));
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
          if (this.shouldRenderCache[fullUrl]) {
            res.send(this.renderedCache[fullUrl]);
          } else {
            this.render(fullUrl).then((resp) => {
              if (resp) res.send(resp);
              else next();
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
    return this.isBot(req);
  }

  isBot(req) {
    const ua = req.get('User-Agent');
    let ret = false;
    this._bots.forEach((b) => {
      if (b.test(ua)) ret = true;
    });
    return ret;
  }

  addBot(botUserAgent) {
    this._bots.push(new RegExp(botUserAgent));
  }

  async launchBrowser() {
    this.browser = await puppeteer.launch({
      headless: process.env.HEADLESS !== 'false',
      devtools: process.env.HEADLESS !== 'false'
    });
    this.launched = true;
    this.browser.on('disconnected', this.launchBrowser.bind(this));
  }

  async render(fullUrl) {
    let pro = Promise.resolve(true);
    if (!this.launched) pro = this.launchBrowser();
    const me = this;
    return pro.then(() => this.browser.newPage()).then(async (page) => {
      const resp = await page.goto(fullUrl, { waitUntil: 'networkidle0' });
      const sRC = !!(resp.headers()['content-type'] && resp.headers()['content-type'].indexOf('html') >= 0);
      let ret;

      if (sRC) {
        process.stdout.write(`Rendering ${fullUrl} with sifrr-seo \n`);
        await page.evaluate(this.constructor.flatteningJS);
        const resp = await page.evaluate(() => new XMLSerializer().serializeToString(document));
        me.renderedCache[fullUrl] = resp;
        ret = resp;
      } else {
        ret = false;
      }

      me.shouldRenderCache[fullUrl] = sRC;
      page.close();
      return ret;
    });
  }
}

module.exports = SifrrSeo;
