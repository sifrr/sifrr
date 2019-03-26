const template = require('./template');
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

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
      .then((resp) => resp.text())
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
    if (this._executed) throw Error(`'${this.elementName}' element's javascript was already executed`);
    this._executed = true;
    if (!js) {
      return this.executeHTMLScripts();
    } else {
      return this.js.then((script) => {
        return new AsyncFunction(script + `\n //# sourceURL=${this.getUrl('js')}`).call();
      }).catch((e) => {
        window.console.error(e);
        window.console.log(`JS file for '${this.elementName}' gave error. Trying to get html file.`);
        return this.executeHTMLScripts();
      });
    }
  }

  executeHTMLScripts() {
    return this.html.then((content) => {
      content.querySelectorAll('script').forEach((script) => {
        if (script.src) {
          // Appending script node directly doesn't work
          const newScript = require('./constants').SCRIPT();
          newScript.src = script.src;
          newScript.type = script.type;
          window.document.body.appendChild(newScript);
        } else {
          return new AsyncFunction(script.text + `\n //# sourceURL=${this.getUrl('html')}`).call({ currentTempate: content.querySelector('template') });
        }
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
