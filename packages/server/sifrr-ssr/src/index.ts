import Renderer, { RendererOptions } from './renderer';
import { Keyv } from 'keyv';

class SifrrSeo {
  private readonly _uas: RegExp[];
  options: {
    userAgents: (RegExp | string)[];
  } & RendererOptions;
  _renderer?: Renderer;

  constructor(options: Partial<SifrrSeo['options']> = {}) {
    this.options = {
      userAgents: [/.*/],
      cacheKey: (url: string): string => url,
      cache: new Keyv(),
      shouldRender: (url, headers): boolean => {
        return this.shouldRender(url, headers);
      },
      ...options
    };
    this._uas = this.options.userAgents.map((ua) => new RegExp(ua));
  }

  get renderer() {
    this._renderer ??= new Renderer(this.options);
    return this._renderer;
  }

  addUserAgent(userAgent: RegExp | string) {
    this._uas.push(new RegExp(userAgent));
  }

  async close() {
    const closed = await this.renderer.close();
    this._renderer = undefined;
    return closed;
  }

  shouldRender(url: string, headers: Record<string, string>) {
    return this._isUserAgent(headers);
  }

  clearCache() {
    this.options.cache?.clear();
  }

  async render(
    url: string,
    headers: Record<string, any>,
    options: {
      background: boolean;
    } = {
      background: false
    }
  ): Promise<string | null> {
    const rendered = this.renderer.render(url, headers);
    if (options.background) return null;
    else return rendered;
  }

  private _isUserAgent(headers: Record<string, string> = {}) {
    const ua = headers['user-agent'] ?? '';
    let ret = false;
    this._uas.forEach((b) => {
      if (b.test(ua)) ret = true;
    });
    return ret;
  }
}

export const botUserAgents = [
  'Googlebot', // Google
  'Bingbot', // Bing
  'Slurp', // Slurp
  'DuckDuckBot', // DuckDuckGo
  'Baiduspider', //Baidu
  'YandexBot', // Yandex
  'Sogou', // Sogou
  'Exabot' // Exalead
];

export { Renderer };

export default SifrrSeo;
