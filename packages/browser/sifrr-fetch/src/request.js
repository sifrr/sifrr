class Request {
  constructor(type, url, options = {}) {
    this.type = type;
    this._options = options;
    this._url = url;
  }

  get response() {
    return window.fetch(this.url, this.options).then(resp => {
      let contentType = resp.headers.get('content-type');
      if (resp.ok) {
        if(contentType && contentType.includes('application/json')) {
          resp = resp.json();
        }
        return resp;
      } else {
        let error = Error(resp.statusText);
        error.response = resp;
        throw error;
      }
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
      method: this.type,
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
