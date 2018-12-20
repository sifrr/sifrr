const fetch = require('@sifrr/fetch');

class Loader {
  constructor(elemName, config = {}) {
    if (this.constructor.all[elemName]) return this.constructor.all[elemName];
    this.elementName = elemName;
    this.config = config;
    this.constructor.urls[elemName] = this.htmlUrl;
  }

  get html() {
    const me = this;
    return fetch.file(this.htmlUrl)
      .then((resp) => resp.text())
      .then((file) => new window.DOMParser().parseFromString(file, 'text/html'))
      .then((html) => {
        Loader.add(me.elementName, html.querySelector('template'));
        return html;
      });
  }

  get htmlUrl() {
    return this.config.url || `${this.config.baseUrl || '/'}elements/${this.elementName.split('-').join('/')}.html`;
  }

  executeScripts() {
    return this.html.then((file) => {
      file.querySelectorAll('script').forEach((script) => {
        let fxn = new Function(script.text).bind(window);
        fxn();
      });
    });
  }

  static add(elemName, instance) {
    Loader._all[elemName] = instance;
  }

  static get all() {
    return Loader._all;
  }
}

Loader._all = {};
Loader.urls = {};

module.exports = Loader;
