/*! Sifrr.Seo v0.0.1-alpha2 - sifrr project */
import puppeteer from 'puppeteer';

class SifrrSeo {
  constuctor(botUserAgents = []) {
    this._bots = botUserAgents.map(ua => new RegExp(ua));
  }

  middleware(req, res) {
    function mw() {
      if (this.isBot(req)) {
        const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        page.goto(fullUrl).then(async () => {
          const renderedContent = await page.evaluate(() => new XMLSerializer().serializeToString(document));
          res.send(renderedContent);
        });
      } else {
        next();
      }
    }

    return mw.bind(this);
  }

  isBot(req) {
    const ua = req.get('User-Agent');
    let ret = false;

    this._bots.forEach(bot => {
      if (bot.test(ua)) {
        ret = true;
      }
    });

    return ret;
  }

  addBot(botUserAgent) {
    this._bots.push(new RegExp(botUserAgent));
  }

  get browser() {
    this._browser = this._browser || puppeteer.launch();
    return this._browser;
  }

  get page() {
    this._page = this._page || this.browser.then(br => br.newPage);
    return this._page;
  }

}

var sifrr_seo = SifrrSeo;

export default sifrr_seo;
/*! (c) @aadityataparia */
