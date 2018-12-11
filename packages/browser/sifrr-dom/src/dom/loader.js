const fetch = require('@sifrr/fetch');

class Loader {
  constructor(elemName) {
    if (this.constructor.all[elemName]) return this.constructor.all[elemName];
    this.elementName = elemName;
    this.constructor.add(elemName, this);
  }

  get template() {
    return this.html.then((file) => file.querySelector('template'));
  }

  get html() {
    this._html = this._html || fetch.file(this.templateUrl).then((file) => new window.DOMParser().parseFromString(file, 'text/html'));
    return this._html;
  }

  get templateUrl() {
    return `/elements/${this.elementName.split('-').join('/')}.html`;
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

module.exports = Loader;
