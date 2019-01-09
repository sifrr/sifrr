/*! Sifrr.Fetch v0.0.1-alpha2 - sifrr project */
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
        if (contentType && contentType.includes('application/json')) {
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
      return this._url + '?' + Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
    } else {
      return this._url;
    }
  }

  get options() {
    const options = Object.assign({
      method: this.type,
      mode: 'cors',
      redirect: 'follow'
    }, this._options);
    options.headers = Object.assign({
      'accept': 'application/json'
    }, this._options.headers || {});

    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body);
    }

    return options;
  }

}

var request = Request;

class SifrrFetch {
  static get(url, options = {}) {
    return new request('GET', url, options).response;
  }

  static post(url, options = {}) {
    return new request('POST', url, options).response;
  }

  static put(url, options = {}) {
    return new request('PUT', url, options).response;
  }

  static delete(url, options = {}) {
    return new request('DELETE', url, options).response;
  }

  static graphql(url, options = {}) {
    const {
      query,
      variables = {}
    } = options;
    delete options.query;
    delete options.variables;
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';
    options.body = {
      query,
      variables
    };
    return new request('POST', url, options).response;
  }

  static file(url, options = {}) {
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    return new request('GET', url, options).response;
  }

}

var sifrr_fetch = SifrrFetch;

export default sifrr_fetch;
/*! (c) @aadityataparia */
