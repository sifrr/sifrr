class SF.API {
  static getHTTP(url, params, callback, failure, type) {
    params = typeof params == 'undefined' ? {} : params;
    let ans = Object.keys(params).map(function(k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k])
      }).join('&'),
      noload = false;
    let http = new XMLHttpRequest(),
      lfres;
    http.onload = function() {
      if (http.status > 199 && http.status < 400) {
        let result = JSON.parse(http.responseText);
        if (typeof callback == "function") {
          callback(result);
        }
        return result;
      } else {
        if (typeof failure == "function") {
          failure(http.status);
        }
        return false;
      }
    };
    http.onerror = function(e) {
      if (!noload) {
        Console.log("Network Error, try again.");
      }
    };
    http.ontimeout = function(e) {
      if (!noload) {
        Console.log('Request timed out');
      }
    }
    http.onprogress = function(e) {
    }
    http.open(type, url + '?' + ans, true);
    http.setRequestHeader("accept", "application/json");
    http.send();
  }
  
  static get(url, params, callback, failure) {
    return SF.API.getHTTP(url, params, callback, failure, "GET");
  }
  
  static post(url, params, callback, failure) {
    return SF.API.getHTTP(url, params, callback, failure, "POST");
  }
  
  static put(url, params, callback, failure) {
    return SF.API.getHTTP(url, params, callback, failure, "PUT");
  }
  
  static delete(url, params, callback, failure) {
    return SF.API.getHTTP(url, params, callback, failure, "DELETE");
  }
}