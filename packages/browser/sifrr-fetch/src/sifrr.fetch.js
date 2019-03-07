const Request = require('./request');
const GraphWS = require('./graphws');

class SifrrFetch {
  static get(purl, poptions) {
    const { url, options } = this.afterUse(purl, poptions, 'GET');
    return new Request(url, options).response;
  }

  static post(purl, poptions) {
    const { url, options } = this.afterUse(purl, poptions, 'POST');
    return new Request(url, options).response;
  }

  static put(purl, poptions) {
    const { url, options } = this.afterUse(purl, poptions, 'PUT');
    return new Request(url, options).response;
  }

  static delete(purl, poptions) {
    const { url, options } = this.afterUse(purl, poptions, 'DELETE');
    return new Request(url, options).response;
  }

  static graphql(purl, poptions) {
    const { url, options } = this.afterUse(purl, poptions, 'POST');
    const { query, variables = {} } = options;
    delete options.query;
    delete options.variables;
    options.headers = options.headers || {};
    options.headers['Content-Type'] = 'application/json';
    options.headers['Accept'] = 'application/json';
    options.body = {
      query,
      variables
    };
    return new Request(url, options).response;
  }

  static graphqlSocket(url, protocol, fallback) {
    return new GraphWS(url, protocol, fallback ? (query, variables) => {
      return this.graphql(fallback.url, {
        method: fallback.method.toUpperCase(),
        query,
        variables
      });
    } : false);
  }

  static file(purl, poptions) {
    const { url, options } = this.afterUse(purl, poptions, 'GET');
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    return new Request(url, options).response;
  }

  static use(fxn) {
    SifrrFetch._middlewares.push(fxn);
  }

  static afterUse(url, options = {}, method) {
    options.method = method;
    SifrrFetch._middlewares.forEach((fxn) => {
      const res = fxn(url, options);
      url = res.url;
      options = res.options;
    });
    return { url, options };
  }
}

SifrrFetch._middlewares = [];

module.exports = SifrrFetch;
