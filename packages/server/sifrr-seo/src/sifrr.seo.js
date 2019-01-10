const puppeteer = require('puppeteer');

class SifrrSeo {
  static flatteningJS() {
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
  }

  get middleware() {
    function mw(req, res, next)  {
      if (!this.isHeadless(req) && this.isBot(req)) {
        const self = this;
        this.page.then(async (page) => {

          const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          const resp = await page.goto(fullUrl, { waitUntil: 'networkidle0' });

          if (resp.headers()['content-type'] && resp.headers()['content-type'].indexOf('html') >= 0) {

            process.stdout.write(`Rendering ${fullUrl} using sifrr-seo.\n`);
            await page.evaluate(self.constructor.flatteningJS);
            const renderedContent = await page.evaluate(() => new XMLSerializer().serializeToString(document));
            res.send(renderedContent);

          } else {
            next();
          }

        });
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

  isBot(req) {
    const ua = req.get('User-Agent');
    const l = this._bots.length;
    for (let i = 0; i < l; i++) {
      if (this._bots[i].test(ua)) return true;
    }
    return false;
  }

  addBot(botUserAgent) {
    this._bots.push(new RegExp(botUserAgent));
  }

  get browser() {
    this._browser = this._browser || puppeteer.launch();
    return this._browser;
  }

  get page() {
    return this.browser.then((br) => br.newPage());
  }
}

module.exports = SifrrSeo;
