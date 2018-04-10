class SFAPI {
  static getHTTP(url, options, type) {
    let ans = Object.keys(options.params || {}).map(k =>
      encodeURIComponent(k) + '=' + encodeURIComponent(options.params[k])
    ).join('&');
    if (type === "POST" && Object.keys(options.body).length > 0) {
      options.headers['content-type'] = 'multipart/form-data';
    }
    Object.assign(options, {
      method: type,
      headers: Object.assign({
        'accept': 'application/json'
      }, options.headers || {}),
      mode: 'cors',
      redirect: 'follow',
    });
    return fetch(url + '?' + ans, options).then(resp => {
      if (resp.ok) {
        try {
          return resp.json()
        } catch (e) {
          return resp.body;
        }
      } else {
        throw Error(resp.statusText);
      }
    });
  }
  static get(url, options = {}) {
    return this.getHTTP(url, options, "GET");
  }

  static post(url, options = {}) {
    return this.getHTTP(url, options, "POST");
  }

  static put(url, options = {}) {
    return this.getHTTP(url, options, "PUT");
  }

  static delete(url, options = {}) {
    return this.getHTTP(url, options, "DELETE");
  }

  static file(url, options = {}) {
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    return this.getHTTP(url, options, "GET");
  }
}