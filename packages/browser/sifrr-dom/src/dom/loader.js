import template from './template';
import config from './config';

export default class Loader {
  static all = {};

  constructor(elemName, url) {
    if (!window.fetch) throw Error('Sifrr.Dom.load requires window.fetch API to work.');
    if (this.constructor.all[elemName]) return this.constructor.all[elemName];
    this.elementName = elemName;
    Loader.all[this.elementName] = this;
    this.url = url;
  }

  executeScripts(js = true) {
    if (this._exec) return this._exec;
    if (!js) {
      return (this._exec = this.constructor.executeHTML(this.getUrl('html'), this)), this._exec;
    } else {
      return (
        (this._exec = this.constructor.executeJS(this.getUrl('js')).catch(e => {
          console.error(e);
          console.log(`JS file for '${this.elementName}' gave error. Trying to get html file.`);
          return this.constructor.executeHTML(this.getUrl('html'), this);
        })),
        this._exec
      );
    }
  }

  getUrl(type = 'js') {
    return (
      this.url || `${config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.${type}`
    );
  }

  static getFile(url) {
    return window.fetch(url).then(resp => {
      if (resp.ok) return resp.text();
      else throw Error(`${this.getUrl('html')} - ${resp.status} ${resp.statusText}`);
    });
  }

  static executeHTML(url, me) {
    return this.getFile(url)
      .then(file => template(file).content)
      .then(content => {
        let promise = Promise.resolve(true);
        me.template = content.querySelector('template');
        content.querySelectorAll('script').forEach(script => {
          if (script.src) {
            window.fetch(script.src);
            promise = promise
              .then(() => window.fetch(script.src).then(resp => resp.text()))
              .then(text => new Function(text + `\n//# sourceURL=${script.src}`).call(window));
          } else {
            promise = promise.then(() =>
              new Function(script.text + `\n//# sourceURL=${url}`).call(window)
            );
          }
        });
        return promise;
      });
  }

  static executeJS(url) {
    return this.getFile(url).then(script => {
      return new Function(script + `\n //# sourceURL=${url}`).call();
    });
  }
}
