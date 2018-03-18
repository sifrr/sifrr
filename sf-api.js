class SFAPI {
  static getHTTP(url, callback, failure, type, {params = {}, headers = {}, data = {}} = {}) {
    let ans = Object.keys(params).map(k =>
        encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
      ).join('&');
    let http = new XMLHttpRequest();
    http.onload = function() {
      if (http.status > 199 && http.status < 400) {
        let result = JSON.parse(http.responseText);
        if (typeof callback == "function") {
          callback(result);
        }
      } else {
        if (typeof failure == "function") {
          failure(http.status);
        }
      }
    }
    http.onerror = function(e) {
      console.log('Network Error, try again.', e);
    }
    http.ontimeout = function(e) {
      console.log('Request timed out', e);
    }
    http.onprogress = function(e) {
    }
    http.open(type, url + '?' + ans, true);

    http.setRequestHeader("Accept", "application/json");
    Object.keys(headers).forEach(k => http.setRequestHeader(k, headers[k]));
    if (type === "POST"){
      http.setRequestHeader("Content-Type", "application/json");
      http.send(JSON.stringify(data));
    } else {
      http.send();
    }
  }

  static get(url, callback, failure, options) {
    return this.getHTTP(url, callback, failure, "GET", options);
  }

  static post(url, callback, failure, options) {
    return this.getHTTP(url, callback, failure, "POST", options);
  }

  static put(url, callback, failure, options) {
    return this.getHTTP(url, callback, failure, "PUT", options);
  }

  static delete(url, callback, failure, options) {
    return this.getHTTP(url, callback, failure, "DELETE", options);
  }
}