import { isObject } from '@/util';
import { SifrrFetchOptions, SifrrFetchResponse } from './types';

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
  const total = Number(resp.headers.get('content-length') ?? 0);
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
          async function read(): Promise<void> {
            const { done, value } = await reader.read();
            if (done) {
              onProgress({
                loaded: total,
                total: total,
                percent: 100,
                speed: loaded / (performance.now() - start)
              });
              controller.close();
              return;
            }
            loaded += value.byteLength;

            onProgress({
              loaded,
              total: total || undefined,
              percent: total ? (loaded / total) * 100 : 50,
              speed: loaded / (performance.now() - start),
              value
            });
            controller.enqueue(value);
            return read();
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
class Request<T, E> {
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

  async response(): Promise<SifrrFetchResponse<T, E>> {
    const { onProgress } = this._options;
    let resp = await fetch(this.url, this.options);
    const showProgress = typeof onProgress === 'function';
    resp = showProgress ? responseProgress(resp, onProgress) : resp;
    const contentType = resp.headers.get('content-type');
    const data = contentType?.includes('application/json') ? await resp.json() : undefined;
    return resp.ok
      ? {
          data: data as T,
          response: resp,
          status: resp.status,
          ok: true
        }
      : {
          errorData: data as E,
          response: resp,
          status: resp.status,
          ok: false
        };
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
    if (isObject(options.body)) {
      options.body = JSON.stringify(options.body);
    }
    return options;
  }
}

export default Request;
