import { SifrrFetchOptions } from './types';

const objConst = {}.constructor;

/**
 * calls onProgress callback on response download progress
 *
 * @param {Response} resp
 * @param {{
 *     (progress: {
 *       loaded?: number;
 *       total?: number;
 *       percent: number;
 *       speed?: number;
 *       value?: Uint8Array;
 *     }): void;
 *   }} onProgress
 * @returns
 */
function responseProgress(
  resp: Response,
  onProgress: Exclude<SifrrFetchOptions['onProgress'], undefined>
) {
  const total = Number(resp.headers.get('content-length') ?? 1);
  if (!total || !resp.body || !ReadableStream) {
    onProgress({
      total: 0,
      percent: 100
    });
    return resp;
  } else {
    const reader = resp.body.getReader();
    let loaded = 0;
    return new Response(
      new ReadableStream({
        start(controller) {
          const start = performance.now();
          function read(): Promise<void> {
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
              } else {
                loaded += value.byteLength;

                onProgress({
                  loaded,
                  total: total,
                  percent: total ? (loaded / total) * 100 : 50,
                  speed: loaded / (performance.now() - start),
                  value
                });
                controller.enqueue(value);
                return read();
              }
            });
          }
          return read();
        }
      })
    );
  }
}

/**
 * @class Request
 */
class Request<T> {
  private readonly _options: SifrrFetchOptions;
  private readonly _url: URL;
  /**
   * @param  {string|URL} url url of request
   * @param  {SifrrFetchOptions} options sifrr fetch options
   */
  constructor(url: string | URL, options: SifrrFetchOptions) {
    this._options = options;
    this._url = new URL(options.baseUrl ?? '' + (typeof url === 'string' ? url : url.href));
  }

  /**
   * @returns Promise<any> response of the request
   */
  response(): Promise<T> {
    const { onProgress } = this._options;
    return fetch(this.url, this.options).then((resp) => {
      const showProgress = typeof onProgress === 'function';
      if (resp.ok) {
        resp = showProgress ? responseProgress(resp, onProgress) : resp;
      } else {
        if (showProgress) onProgress({ percent: 100 });
        const error = Error(resp.statusText);
        error.response = resp;
        throw error;
      }
      const contentType = resp.headers.get('content-type');
      return contentType?.includes('application/json') ? resp.json() : resp;
    });
  }

  /**
   * url with encoded params
   * @readonly
   */
  get url() {
    const { params } = this._options;
    if (params && Object.keys(params).length > 0) {
      Object.keys(params).forEach((key) => {
        this._url.searchParams.set(key, params[key] as string);
      });
    }
    return this._url.href;
  }

  /**
   * merged options with default options
   * @readonly
   * @type {RequestInit}
   */
  get options(): RequestInit {
    const options = {
      redirect: 'follow' as const,
      ...this._options
    };
    if (options.body && (options.body.constructor === objConst || Array.isArray(options.body))) {
      options.body = JSON.stringify(options.body);
    }
    return options;
  }
}

export default Request;
