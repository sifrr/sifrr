class SFAPI {
  static getHTTP(url, options, type, progress) {
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
      let length = resp.headers.get("Content-Length");
      if (length) {
        let reader = resp.clone().body.getReader();
        let received = 0;
        reader.read().then(function pR({done, value}) {
          if (done) {
            return;
          }
          received += value.length;
          if (typeof progress === 'function') progress(received/length);
          return reader.read().then(pR);
        });
      }
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
  static get(url, options = {}, progress) {
    return this.getHTTP(url, options, "GET", progress);
  }

  static post(url, options = {}, progress) {
    return this.getHTTP(url, options, "POST", progress);
  }

  static put(url, options = {}, progress) {
    return this.getHTTP(url, options, "PUT", progress);
  }

  static delete(url, options = {}, progress) {
    return this.getHTTP(url, options, "DELETE", progress);
  }

  static file(url, options = {}, progress) {
    options.headers = options.headers || {};
    options.headers.accept = options.headers.accept || '*/*';
    return this.getHTTP(url, options, "GET", progress);
  }
}