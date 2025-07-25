import Request from './request';
import Socket from './socket';
import { SifrrFetchOptions, BeforeOpts, SifrrFetchResponse } from './types';

const httpMethodsWithoutBody = ['GET', 'OPTIONS', 'HEAD', 'DELETE'] as const;
const httpMethodsWithBody = ['POST', 'PUT', 'PATCH'] as const;

const isAbort = !!AbortController;
const TimeoutError = new Error('Request timed out');

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class SifrrFetch {
  static async request<T = any, E = any>(
    u: string,
    o: SifrrFetchOptions = {},
    m = 'GET'
  ): Promise<SifrrFetchResponse<T, E>> {
    o.method = o.method ?? m;
    let opts: BeforeOpts = { url: u, options: o };
    if (typeof o.before === 'function') {
      opts = (await o.before(opts)) ?? opts;
    }

    if (typeof o.use === 'function') {
      try {
        const r = await o.use(opts);
        if (r) {
          return {
            data: await r,
            ok: true,
            response: undefined,
            headers: new Headers(),
            status: 200,
            errorData: undefined
          };
        }
      } catch (e) {
        window.console.error(e);
      }
    }

    const controller: AbortController | undefined = isAbort ? new AbortController() : undefined;
    opts.options.signal = controller?.signal;
    const response = new Request<T, E>(opts.url, opts.options).response();
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
    ]);

    if (typeof o.after === 'function')
      promise.then((x) => {
        return o.after?.(x as SifrrFetchResponse<T, E>);
      });
    return promise as Promise<SifrrFetchResponse<T, E>>;
  }

  defaultOptions: SifrrFetchOptions;

  constructor(defaultOptions: SifrrFetchOptions = {}) {
    this.defaultOptions = defaultOptions;
  }

  protected _tOptions(options?: SifrrFetchOptions, body?: any) {
    const retOptions = { ...this.defaultOptions, ...options, body };
    retOptions.headers = Object.assign(retOptions.headers ?? {}, this.defaultOptions.headers);
    return retOptions;
  }
}

type SifrrFetchWithBody = <T = any, E = any>(
  url: string,
  body?: any,
  options?: Omit<SifrrFetchOptions, 'body'>
) => Promise<SifrrFetchResponse<T, E>>;
type SifrrFetchWithoutBody = <T = any, E = any>(
  url: string,
  options?: SifrrFetchOptions
) => Promise<SifrrFetchResponse<T, E>>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
interface SifrrFetch {
  get: SifrrFetchWithoutBody;
  post: SifrrFetchWithBody;
  put: SifrrFetchWithBody;
  patch: SifrrFetchWithBody;
  options: SifrrFetchWithoutBody;
  head: SifrrFetchWithoutBody;
  delete: SifrrFetchWithoutBody;
}

httpMethodsWithoutBody.forEach((m) => {
  const ml = m.toLowerCase() as Lowercase<typeof m>;
  SifrrFetch.prototype[ml] = function (url, options) {
    return SifrrFetch.request(url, this._tOptions(options), m);
  };
});

httpMethodsWithBody.forEach((m) => {
  const ml = m.toLowerCase() as Lowercase<typeof m>;
  SifrrFetch.prototype[ml] = function (url, body, options) {
    return SifrrFetch.request(url, this._tOptions(options, body), m);
  };
});

const defaultFetch = new SifrrFetch();

export { defaultFetch as sFetch, SifrrFetch as Fetch, Socket };
