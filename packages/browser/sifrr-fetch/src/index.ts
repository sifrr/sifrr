import Request from './request';
import Socket from './socket';
import { SifrrFetchOptions, BeforeOpts } from './types';

const httpMethods = ['GET', 'POST', 'PUT', 'OPTIONS', 'PATCH', 'HEAD', 'DELETE'] as const;
const isAbort = !!AbortController;
const TimeoutError = new Error('Request timed out');

class SifrrFetch {
  static readonly Socket = Socket;

  static socket(url: string, protocols: string, fallback: () => Promise<never>) {
    return new Socket(url, protocols, fallback);
  }

  static async request<T>(u: string, o: SifrrFetchOptions<T> = {}, m = 'GET'): Promise<T> {
    o.method = o.method ?? m;
    let opts: BeforeOpts<T> = { url: u, options: o };
    if (typeof o.before === 'function') {
      opts = (await o.before(opts)) ?? opts;
      delete o.before;
    }

    if (typeof o.use === 'function') {
      try {
        const r = o.use?.(opts);
        delete o.use;
        return r;
      } catch (e) {
        window.console.error(e);
      }
    }

    const controller: AbortController | undefined = isAbort ? new AbortController() : undefined;
    opts.options.signal = controller?.signal;
    const response = new Request<T>(opts.url, opts.options).response();
    const promise = Promise.race([
      response,
      opts.options.timeout
        ? new Promise((_, reject) =>
            setTimeout(() => reject(TimeoutError), opts.options.timeout)
          ).catch((e) => {
            if (isAbort) controller?.abort();
            throw e;
          })
        : response
    ]) as Promise<T>;

    if (typeof o.after === 'function')
      promise.then((x: T) => {
        o.after?.(x);
        return x;
      });
    return promise;
  }

  defaultOptions: SifrrFetchOptions;

  constructor(defaultOptions: SifrrFetchOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  protected _tOptions(options: SifrrFetchOptions) {
    const retOptions = { ...this.defaultOptions, ...options };

    retOptions.headers = Object.assign(options.headers ?? {}, this.defaultOptions.headers);
    return retOptions;
  }
}

interface SifrrFetch {
  get: <T = any>(url: string, options: SifrrFetchOptions<T>) => Promise<T>;
  post: <T = any>(url: string, options: SifrrFetchOptions<T>) => Promise<T>;
  put: <T = any>(url: string, options: SifrrFetchOptions<T>) => Promise<T>;
  patch: <T = any>(url: string, options: SifrrFetchOptions<T>) => Promise<T>;
  options: <T = any>(url: string, options: SifrrFetchOptions<T>) => Promise<T>;
  head: <T = any>(url: string, options: SifrrFetchOptions<T>) => Promise<T>;
  delete: <T = any>(url: string, options: SifrrFetchOptions<T>) => Promise<T>;
}

httpMethods.forEach((m) => {
  const ml = m.toLowerCase() as Lowercase<typeof m>;
  SifrrFetch.prototype[ml] = function (url: string, options: SifrrFetchOptions) {
    return SifrrFetch.request(url, this._tOptions(options), m);
  };
});

export default SifrrFetch;
