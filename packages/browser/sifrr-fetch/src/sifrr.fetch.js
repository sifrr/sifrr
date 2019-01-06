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

  static graphql(url, options = {}) {
    const { query, variables = {} } = options;
    delete options.query;
    delete options.variables;
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';
    options.body = {
      query,
      variables
    };
    return new Request('POST', url, options).response;
  }

  static file(url, options = {}) {
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    return new Request('GET', url, options).response;
  }
}

module.exports = SifrrFetch;
