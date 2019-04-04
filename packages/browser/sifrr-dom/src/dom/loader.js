const template = require('./template');

class Loader {
  constructor(elemName, url) {
    if (!window.fetch) throw Error('Sifrr.Dom.load requires Fetch API to work.');
    if (this.constructor.all[elemName]) return this.constructor.all[elemName];
    this.elementName = elemName;
    this.url = url;
  }

  get html() {
    if (this._html) return this._html;
    Loader.add(this.elementName, this);
    const me = this;
    this._html = window.fetch(this.getUrl('html'))
      .then((resp) => {
        if (resp.ok) return resp.text();
        else {
          throw Error(`${this.getUrl('html')} - ${resp.status} ${resp.statusText}`);
        }
      })
      .then((file) => template(file).content).then((content) => {
        me.template = content.querySelector('template');
        return content;
      });
    return this._html;
  }

  get js() {
    if (this._js) return this._js;
    Loader.add(this.elementName, this);
    this._js = window.fetch(this.getUrl('js'))
      .then((resp) => resp.text());
    return this._js;
  }

  getUrl(type = 'js') {
    return this.url || `${window.Sifrr.Dom.config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.${type}`;
  }

  executeScripts(js) {
    if (this._executed) return Promise.reject(Error(`'${this.elementName}' element's javascript was already executed`));
    if (!js) {
      return this.executeHTMLScripts().then(() => this._executed = true);
    } else {
      return this.js.then((script) => {
        return new Function(script + `\n //# sourceURL=${this.getUrl('js')}`).call();
      }).then(() => this._executed = true).catch((e) => {
        window.console.error(e);
        window.console.log(`JS file for '${this.elementName}' gave error. Trying to get html file.`);
        return this.executeHTMLScripts();
      }).then(() => this._executed = true);
    }
  }

  executeHTMLScripts() {
    return this.html.then((content) => {
      let promise = Promise.resolve(true);
      content.querySelectorAll('script').forEach((script) => {
        if (script.src) {
          window.fetch(script.src);
          promise = promise.then(() => window.fetch(script.src)
            .then(resp => resp.text())
            .then(text => new Function(text + `\n//# sourceURL=${script.src}`).call(window)));
        } else {
          promise = promise.then(() => new Function(script.text + `\n//# sourceURL=${this.getUrl('html')}`).call(window));
        }
      });
      return promise;
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
