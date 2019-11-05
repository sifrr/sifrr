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
  onProgress: {
    (progress: {
      loaded?: number;
      total?: number;
      percent: number;
      speed?: number;
      value?: Uint8Array;
    }): void;
  }
) {
  const contentLength = resp.headers.get('content-length');
  const total = parseInt(contentLength, 10);
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
          function read() {
            // eslint-disable-next-line consistent-return
            return reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
              } else {
                loaded += value.byteLength;
                onProgress({
                  loaded,
                  total,
                  percent: (loaded / total) * 100,
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
class Request {
  private _options: SifrrFetchOptions;
  private _url: string;
  /**
   * @param  {string|number} url url of request
   * @param  {SifrrFetchOptions} options sifrr fetch options
   */
  constructor(url: string | number, options: SifrrFetchOptions) {
    this._options = options;
    this._url = (options.host || '') + url;
  }

  /**
   * @returns Promise<any> response of the request
   */
  response() {
    const { onProgress } = this._options;
    return fetch(this.url, this.options).then(resp => {
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
      return contentType && contentType.includes('application/json') ? resp.json() : resp;
    });
  }

  /**
   * url with encoded params
   * @readonly
   */
  get url() {
    const { params } = this._options;
    if (params && Object.keys(params).length > 0) {
      return (
        this._url +
        '?' +
        Object.keys(params)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
          .join('&')
      );
    } else {
      return this._url;
    }
  }

  /**
   * merged options with default options
   * @readonly
   * @type {RequestInit}
   */
  get options(): RequestInit {
    this._options.defaultOptions = this._options.defaultOptions || {};
    const options = {
      redirect: 'follow',
      ...this._options.defaultOptions,
      ...this._options
    };
    delete options.defaultOptions;
    options.headers = Object.assign(
      this._options.headers || {},
      this._options.defaultOptions.headers
    );
    if (options.body && (options.body.constructor === objConst || Array.isArray(options.body))) {
      options.headers['content-type'] = options.headers['content-type'] || 'application/json';
    }
    if (options.headers['content-type'] && options.headers['content-type'].indexOf('json') > -1) {
      options.body = JSON.stringify(options.body);
    }
    return options as RequestInit;
  }
}

export default Request;
