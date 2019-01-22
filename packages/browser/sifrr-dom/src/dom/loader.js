const fetch = require('@sifrr/fetch');
const TEMPLATE = require('./constants').TEMPLATE();

class Loader {
  constructor(elemName, config = {}) {
    if (!fetch) throw Error('Sifrr.Dom.load requires Sifrr.Fetch to work.');
    if (this.constructor.all[elemName]) return this.constructor.all[elemName].instance;
    this.elementName = elemName;
    this.config = config;
    this.constructor.urls[elemName] = this.htmlUrl;
  }

  get html() {
    const me = this;
    if (this.constructor.all[this.elementName] && this.constructor.all[this.elementName].html) return this.constructor.all[this.elementName].html;
    const html = fetch.file(this.htmlUrl)
      .then((resp) => resp.text())
      .then((file) => {
        TEMPLATE.innerHTML = file;
        return TEMPLATE.content;
      }).then((html) => {
        Loader._all[me.elementName].template = html.querySelector('template');
        return html;
      });
    Loader.add(me.elementName, { instance: me, html: html });
    return html;
  }

  get js() {
    const me = this;
    if (this.constructor.all[this.elementName] && this.constructor.all[this.elementName].js) return this.constructor.all[this.elementName].js;
    const js = fetch.file(this.jsUrl)
      .then((resp) => resp.text());
    Loader.add(me.elementName, { instance: me, js: js });
    return js;
  }

  get htmlUrl() {
    return this.config.url || `${this.config.baseUrl + '/' || ''}elements/${this.elementName.split('-').join('/')}.html`;
  }

  get jsUrl() {
    return this.config.url || `${this.config.baseUrl + '/' || ''}elements/${this.elementName.split('-').join('/')}.js`;
  }

  executeScripts() {
    return this.html.then((file) => {
      file.querySelectorAll('script').forEach((script) => {
        if (script.hasAttribute('src')) {
          window.document.body.appendChild(script);
        } else {
          new Function(script.text).bind(window)();
        }
      });
    }).catch((e) => {
      window.console.warn(e);
      window.console.log(`Failed to fetch HTML. Trying to get js file for ${this.elementName}.`);
      this.js.then((script) => {
        new Function(script).bind(window)();
      });
    });
  }

  static add(elemName, instance) {
    Loader._all[elemName] = Object.assign(Loader._all[elemName] || {}, instance);
  }

  static get all() {
    return Loader._all;
  }
}

Loader._all = {};
Loader.urls = {};

module.exports = Loader;
