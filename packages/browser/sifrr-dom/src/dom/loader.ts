import template from './template';
import config from './config';

class Loader {
  public static all = {};

  private _exec: Promise<unknown>;
  public readonly elementName: string;
  public readonly url: string;
  public template: HTMLTemplateElement;

  constructor(elemName: string, url?: string) {
    if (!fetch) throw Error('Sifrr.Dom.load requires window.fetch API to work.');

    if ((<typeof Loader>this.constructor).all[elemName])
      return (<typeof Loader>this.constructor).all[elemName];
    this.elementName = elemName;
    (<typeof Loader>this.constructor).all[this.elementName] = this;
    this.url = url;
  }

  executeScripts(js = true) {
    if (this._exec) return this._exec;
    if (!js) {
      return (
        (this._exec = (<typeof Loader>this.constructor).executeHTML(this.getUrl('html'), this)),
        this._exec
      );
    } else {
      return (
        (this._exec = (<typeof Loader>this.constructor)
          .executeJS(this.getUrl('js'))
          .catch((e: any) => {
            console.error(e);
            console.log(`JS file for '${this.elementName}' gave error. Trying to get html file.`);
            return (<typeof Loader>this.constructor).executeHTML(this.getUrl('html'), this);
          })),
        this._exec
      );
    }
  }

  getUrl(type = 'js') {
    if (this.url) return this.url;
    if (typeof config.url === 'function') return config.url(this.elementName);
    return `${config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.${type}`;
  }

  static getFile(url: RequestInfo) {
    return window.fetch(url).then(resp => {
      if (resp.ok) return resp.text();
      else throw Error(`${url} - ${resp.status} ${resp.statusText}`);
    });
  }

  static executeHTML(url: any, me: Loader) {
    return this.getFile(url)
      .then(file => template(file).content)
      .then(content => {
        let promise = Promise.resolve(true);
        me.template = content.querySelector('template');
        content.querySelectorAll('script').forEach((script: HTMLScriptElement) => {
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

  static executeJS(url: string): Promise<unknown> {
    return this.getFile(url).then(script => {
      return new Function(script + `\n //# sourceURL=${url}`).call(window);
    });
  }
}

export default Loader;
