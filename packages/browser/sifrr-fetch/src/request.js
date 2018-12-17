class Request {
  constructor(type, url, options) {
    this.type = type;
    this._options = options;
    this._url = url;
  }

  get response() {
    return window.fetch(this.url, this.options).then(resp => {
      let contentType = resp.headers.get('content-type');
      if(contentType && contentType.includes('application/json')) {
        resp = resp.json();
      }
      if (resp.ok) {
        return resp;
      } else {
        let error = Error(resp.statusText);
        error.response = resp;
        throw error;
      }
    });
  }

  get url() {
    let params = delete this._options.params;
    if (params && Object.keys(params).length > 0) {
      return this._url + '?' + Object.keys(params).map(k =>
        encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
      ).join('&');
    } else {
      return this._url;
    }
  }

  get options() {
    return Object.assign(this._options, {
      method: this.type,
      headers: Object.assign({
        'accept': 'application/json'
      }, this._options.headers || {}),
      mode: 'cors',
      redirect: 'follow'
    });
  }
}

module.exports = Request;
