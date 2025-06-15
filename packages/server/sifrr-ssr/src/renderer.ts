import puppeteer, { Browser, HTTPResponse, LaunchOptions, Page } from 'puppeteer';
import PageRequest from './pagerequest';
import { Keyv } from 'keyv';

const prohibitedHeaders = [
  'authorization',
  'cookie',
  'if-modified-since',
  'cookie2',
  'content-length',
  'connection',
  'keep-alive',
  'host',
  'transfer-encoding',
  'if-none-match'
];
const SIFRR_USER_AGENT = 'sifrr/ssr';

export type RendererOptions = {
  cacheKey: (url: string, headers: Record<string, string>) => any;
  /**
   * Keyv Cache store to use for render cache.
   * It will use memory keyv store by default
   */
  cache: Keyv;
  shouldRender: (url: string, headers: Record<string, string>) => boolean;
  filterOutgoingRequests?: (url: string) => boolean;
  beforeRender?: (page: Page, url: string) => void | Promise<void>;
  afterRender?: (page: Page, url: string) => void | Promise<void>;
  puppeteerOptions?: LaunchOptions;
};

class Renderer {
  status: number;
  puppeteerOptions: LaunchOptions;
  options: RendererOptions;
  _browser?: Promise<Browser>;
  private shouldRenderCache: Record<string, boolean> = {};

  constructor(options: RendererOptions) {
    this.status = 0;
    this.puppeteerOptions = {
      headless: true,
      args: [],
      ...options.puppeteerOptions
    };
    this.puppeteerOptions.args?.push('--no-sandbox', '--disable-setuid-sandbox');
    this.options = options;
  }

  async browserAsync(): Promise<Browser> {
    this._browser ??= puppeteer.launch(this.puppeteerOptions).then((b) => {
      b.on('disconnected', () => {
        /* istanbul ignore next */
        this._browser = undefined;
      });
      return b;
    });
    return this._browser;
  }

  async close() {
    return (await (await this._browser)?.close()) ?? true;
  }

  async render(url: string, headers: Record<string, string> = {}): Promise<string | null> {
    if (headers['user-agent']?.includes(SIFRR_USER_AGENT)) {
      return null;
    }
    if (this.getShouldRenderCache(url, headers) === false) {
      return null;
    }
    const shouldRender = this.options.shouldRender(url, headers);
    this.setShouldRenderCache(url, headers, shouldRender);

    if (!shouldRender) return null;

    const key = this.options.cacheKey(url, headers);
    const cachedVal = await this.options.cache?.get<string>(key);
    if (cachedVal) {
      return cachedVal;
    }

    const b = await this.browserAsync();
    const newp = await b.newPage();
    const fetches = new PageRequest(newp, this.options.filterOutgoingRequests);
    await fetches.addListener;

    prohibitedHeaders.forEach((h) => delete headers[h]);
    Object.keys(headers).forEach((h) => {
      if (h.startsWith('proxy')) delete headers[h];
      if (h.startsWith('sec-')) delete headers[h];
    });
    await this.options.beforeRender?.(newp, url);

    headers['user-agent'] = (headers['user-agent'] ?? '') + ' ' + SIFRR_USER_AGENT;
    await newp.setExtraHTTPHeaders(headers);

    const resp = await newp.goto(url, { waitUntil: 'networkidle0' });
    const status = resp?.status() ?? 200;

    const sRC = this.isHTML(resp);
    let ret: string | null;
    if (sRC && status < 300) {
      await this.options.afterRender?.(newp, url);
      await fetches.all();
      ret = await newp.evaluate(() => {
        return (
          document.documentElement.getHTML?.({ serializableShadowRoots: true }) ??
          document.documentElement.outerHTML
        );
      });
      this.options.cache.set(key, ret);
    } else if (status > 499) {
      ret = null;
    } else {
      this.setShouldRenderCache(url, headers, false);
      ret = null;
    }

    await newp.close();

    return ret;
  }

  private setShouldRenderCache(url: string, headers: Record<string, string>, val: boolean) {
    const key = this.options.cacheKey(url, headers);
    this.shouldRenderCache[key] = val;
  }

  private getShouldRenderCache(url: string, headers: Record<string, string>) {
    const key = this.options.cacheKey(url, headers);
    if (this.shouldRenderCache[key] === undefined) return null;
    return this.shouldRenderCache[key];
  }

  isHTML(puppeteerResp: HTTPResponse | null) {
    return puppeteerResp?.headers()['content-type']?.includes('html') ?? false;
  }
}

export default Renderer;
