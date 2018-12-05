const Request = require('./request');

class SifrrFetch {
  static get(url, options = {}) {
    return new Request('GET', url, options).response;
  }

  static post(url, options = {}) {
    return new Request('POST', url, options).response;
  }

  static put(url, options = {}) {
    return new Request('PUT', url, options).response;
  }

  static delete(url, options = {}) {
    return new Request('DELETE', url, options).response;
  }

  static file(url, options = {}) {
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    return new Request('GET', url, options).response;
  }
}

module.exports = SifrrFetch;
