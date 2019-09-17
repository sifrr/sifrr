const ObjConst = {}.constructor;

function responseProgress(resp, onProgress) {
  const contentLength = resp.headers.get('content-length');
  const total = parseInt(contentLength, 10);
  if (!total || !resp.body || !window.ReadableStream) {
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

class Request {
  constructor(url, options) {
    this._options = options;
    this._url = url;
  }

  response() {
    const { onProgress = () => {} } = this._options;
    return fetch(this.url, this.options).then(resp => {
      const contentType = resp.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      if (resp.ok) {
        resp = responseProgress(resp, onProgress);
      } else {
        onProgress({ percent: 100 });
        let error = Error(resp.statusText);
        error.response = resp;
        throw error;
      }
      if (isJson) return resp.json();
      return resp;
    });
  }

  get url() {
    const { params, host } = this._options;
    if (params && Object.keys(params).length > 0) {
      return (
        (host || '') +
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

  get options() {
    const dOpts = this._options.defaultOptions || {};
    delete this._options.defaultOptions;
    const options = Object.assign(
      {
        redirect: 'follow',
        ...dOpts
      },
      this._options
    );
    options.headers = Object.assign(this._options.headers || {}, dOpts.headers);
    if (options.body && (options.body.constructor === ObjConst || Array.isArray(body))) {
      options.headers['content-type'] = options.headers['content-type'] || 'application/json';
    }
    if (options.headers['content-type'].indexOf('json') > -1) {
      options.body = JSON.stringify(options.body);
    }
    return options;
  }
}

export default Request;
