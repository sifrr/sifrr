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

  executeScripts() {
    if (this._exec) return this._exec;
    return (
      (this._exec = (<typeof Loader>this.constructor).executeJS(this.getUrl()).catch((e: any) => {
        console.error(e);
        console.log(`JS file for '${this.elementName}' gave error.`);
      })),
      this._exec
    );
  }

  getUrl() {
    if (this.url) return this.url;
    if (typeof config.url === 'function') return config.url(this.elementName);
    return `${config.baseUrl + '/'}elements/${this.elementName}.js`;
  }

  static getFile(url: RequestInfo) {
    return window.fetch(url).then(resp => resp.text());
  }

  static executeJS(url: string): Promise<unknown> {
    return this.getFile(url).then(script => {
      return new Function(script + `\n //# sourceURL=${url}`).call(window);
    });
  }
}

export default Loader;
