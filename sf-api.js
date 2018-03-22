class SFAPI {
  static getHTTP(url, options, type) {
    options = Object.assign({params: {}, headers: {}, data: {}}, options);
    let ans = Object.keys(options.params).map(k =>
        encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
      ).join('&');
    let defaultHeaders = {
      'accept': 'application/json'
    }
    Object.assign(options, {
      method: type,
      headers: Object.assign(defaultHeaders, options.headers),
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow',
    });
    if (type === "POST" && Object.keys(options.data).length > 0){
      options.headers['content-type'] = 'application/json';
    }
    return fetch(url + '?' + ans, options).then(resp => resp.json());
  }

  static get(url, options) {
    return this.getHTTP(url, options, "GET");
  }

  static post(url, options) {
    return this.getHTTP(url, options, "POST");
  }

  static put(url, options) {
    return this.getHTTP(url, options, "PUT");
  }

  static delete(url, options) {
    return this.getHTTP(url, options, "DELETE");
  }
}