const ObjConst = {}.constructor;

class Request {
  constructor(url, options) {
    this._options = options;
    this._url = url;
  }

  response() {
    const me = this;
    return fetch(this.url, this.options)
      .then(resp => {
        const contentType = resp.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        if (resp.ok && typeof me._options.onProgress === 'function') {
          const contentLength = resp.headers.get('content-length');
          const total = parseInt(contentLength, 10);
          if (!total || !resp.body || !ReadableStream) {
            me._options.onProgress({
              total: 0,
              percent: 100
            });
          } else {
            const reader = resp.body.getReader();
            let loaded = 0;
            resp = new Response(
              new ReadableStream({
                start(controller) {
                  const start = performance.now();
                  function read() {
                    return reader.read().then(({ done, value }) => {
                      if (done) {
                        controller.close();
                      } else {
                        loaded += value.byteLength;
                        me._options.onProgress({
                          loaded: loaded,
                          total: total,
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
        } else if (!resp.ok) {
          if (typeof me._options.onProgress === 'function')
            me._options.onProgress({ percent: 100 });
          let error = Error(resp.statusText);
          error.response = resp;
          throw error;
        }
        return {
          response: resp,
          isJson
        };
      })
      .then(({ response, isJson }) => {
        if (isJson) return response.json();
        return response;
      });
  }

  get url() {
    const params = this._options.params;
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

  get options() {
    const options = Object.assign(
      {
        redirect: 'follow'
      },
      this._options
    );
    options.headers = this._options.headers || {};
    if (options.body && options.body.constructor === ObjConst) {
      options.headers['content-type'] = options.headers['content-type'] || 'application/json';
      options.body = JSON.stringify(options.body);
    }
    return options;
  }
}

module.exports = Request;
