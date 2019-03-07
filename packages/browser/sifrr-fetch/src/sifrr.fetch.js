const Request = require('./request');
const WebSocket = require('./websocket');

class SifrrFetch {
  static get(purl, poptions) {
    return this.request(purl, poptions, 'GET');
  }

  static post(purl, poptions) {
    return this.request(purl, poptions, 'POST');
  }

  static put(purl, poptions) {
    return this.request(purl, poptions, 'PUT');
  }

  static delete(purl, poptions) {
    return this.request(purl, poptions, 'DELETE');
  }

  static graphql(purl, poptions) {
    const { query, variables = {} } = poptions;
    delete poptions.query;
    delete poptions.variables;
    poptions.headers = poptions.headers || {};
    poptions.headers['Content-Type'] = 'application/json';
    poptions.headers['Accept'] = 'application/json';
    poptions.body = {
      query,
      variables
    };
    return this.request(purl, poptions, 'POST');
  }

  static socket(url, protocol, fallback) {
    return new WebSocket(url, protocol, fallback ? (message) => {
      const options = { method: fallback.method };
      if (options.method === 'POST') options.body = message;
      else options.query = message;
      return this.request(fallback.url, options);
    } : false);
  }

  static file(purl, poptions) {
    poptions.headers = poptions.headers || {};
    poptions.headers.accept = poptions.headers.accept || '*/*';
    return this.request(purl, poptions, 'GET');
  }

  static request(purl, poptions, method) {
    const { url, options } = this.afterUse(purl, poptions, method);
    return new Request(url, options).response;
  }

  static use(fxn) {
    SifrrFetch._middlewares.push(fxn);
  }

  static afterUse(url, options = {}, method) {
    options.method = (options.method  || method).toUpperCase();
    SifrrFetch._middlewares.forEach((fxn) => {
      const res = fxn(url, options);
      url = res.url;
      options = res.options;
    });
    return { url, options };
  }
}

SifrrFetch._middlewares = [];
SifrrFetch.WebSocket = WebSocket;

module.exports = SifrrFetch;
