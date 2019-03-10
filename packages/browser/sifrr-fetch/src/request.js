class Request {
  constructor(url, options) {
    this._options = options;
    this._url = url;
  }

  get response() {
    const me = this;
    return window.fetch(this.url, this.options).then(resp => {
      const contentType = resp.headers.get('content-type');
      const isJson = contentType && (contentType.includes('application/json'));
      if (resp.ok && typeof me._options.onProgress === 'function') {
        const contentLength = resp.headers.get('content-length');
        const total = parseInt(contentLength,10);
        if (!total || !resp.body) {
          me._options.onProgress(100);
        } else {
          const reader = resp.body.getReader();
          let loaded = 0;
          resp = new Response(new ReadableStream({
            start(controller) {
              function read() {
                return reader.read().then(({ done, value }) => {
                  if (done) {
                    me._options.onProgress(100);
                    controller.close();
                  } else {
                    loaded += value.byteLength;
                    me._options.onProgress(loaded / total * 100);
                    controller.enqueue(value);
                    return read();
                  }
                });
              }
              return read();
            }
          }));
        }
      } else if (!resp.ok) {
        if (typeof me._options.onProgress === 'function') me._options.onProgress(100);
        let error = Error(resp.statusText);
        error.response = resp;
        throw error;
      }
      return {
        response: resp,
        isJson
      };
    }).then(({ response, isJson }) => {
      if(isJson) return response.json();
      return response;
    });
  }

  get url() {
    const params = this._options.params;
    if (params && Object.keys(params).length > 0) {
      return this._url + '?' + Object.keys(params).map(k =>
        encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
      ).join('&');
    } else {
      return this._url;
    }
  }

  get options() {
    const options = Object.assign({
      mode: 'cors',
      redirect: 'follow',
      cache: 'no-cache'
    }, this._options);
    options.headers = Object.assign({
      accept: 'application/json'
    }, this._options.headers || {});
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }
    return options;
  }
}

module.exports = Request;
