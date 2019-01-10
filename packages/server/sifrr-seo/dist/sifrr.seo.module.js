/*! Sifrr.Seo v0.0.1-alpha2 - sifrr project */
import puppeteer from 'puppeteer';

class SifrrSeo {
  static flatteningJS() {
    if (typeof Sifrr === 'undefined' || typeof !Sifrr.Dom === 'undefined') return false;
    const defined = Object.keys(Sifrr.Dom.elements);
    defined.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el.shadowRoot) el.appendChild(el.shadowRoot);
      });
    });
    return true;
  }

  constructor(botUserAgents = ['Googlebot', // Google
  'Bingbot', // Bing
  'Slurp', // Slurp
  'DuckDuckBot', // DuckDuckGo
  'Baiduspider', //Baidu
  'YandexBot', // Yandex
  'Sogou', // Sogou
  'Exabot']) {
    this._bots = botUserAgents.map(ua => new RegExp(ua));
  }

  get middleware() {
    function mw(req, res, next) {
      if (!this.isHeadless(req) && this.isBot(req)) {
        const self = this;
        const browser = this.browser;
        browser.then(br => {
          return br.newPage();
        }).then(async page => {
          const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          const resp = await page.goto(fullUrl, {
            waitUntil: 'networkidle0'
          });

          if (resp.headers()['content-type'] && resp.headers()['content-type'].indexOf('html') >= 0) {
            process.stdout.write(`Rendering ${fullUrl} using sifrr-seo.\n`);
            await page.evaluate(self.constructor.flatteningJS);
            const renderedContent = await page.evaluate(() => new XMLSerializer().serializeToString(document));
            res.send(renderedContent);
          } else {
            next();
          }
        }).then(() => {
          return browser.close();
        }).catch(e => {
          process.stdout.write(e);
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
    return puppeteer.launch();
  }

}

var sifrr_seo = SifrrSeo;

export default sifrr_seo;
/*! (c) @aadityataparia */
