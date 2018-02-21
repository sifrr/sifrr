var SF = {
  API: {
    getHTTP: function(url, params, callback, failure, type) {
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
    },
    get: function(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "GET");
    },
    post: function(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "POST");
    },
    put: function(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "PUT");
    },
    delete: function(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "DELETE");
    }
  },
  loadCustomElement: function(elements) {
    forEach(elements, function(el){loadElement(el)});
    function loadElement(element){
      let link = document.createElement('link');
      link.rel = 'import';
      link.href = './elements/' + element + '.html';
      link.setAttribute('async', '');
      link.onload = function(e) {
        let proto = Object.create(HTMLElement.prototype);
        proto.createdCallback = function() {
          let template = link.import.querySelector('template');
          let clone = document.importNode(template.content, true);
          let root = this.createShadowRoot();
          root.appendChild(clone);
          let defaultBind = SF.defaultBind[element] ? SF.defaultBind[element] : {};
          let html = this.shadowRoot.innerHTML;
          this.dataset.originalHtml = html;
          SF.replaceBindData(this, defaultBind);
          if (typeof SF.createdCallback[element] === "function") {
            SF.createdCallback[element](this);
          }
        };
        proto.attributeChangedCallback = function(attrName, oldVal, newVal) {
          if (attrName == "data-bind") {
            let html = SF.replaceBindData(this, {});
          }
          if (typeof SF.attributeChangedCallback[element] === "function") {
            SF.attributeChangedCallback[element](this);
          }
        };
        proto.attachedCallback = function() {
          if (typeof SF.attachedCallback[element] === "function") {
            SF.attachedCallback[element](this);
          }
        };
        proto.detachedCallback = function() {
          if (typeof SF.detachedCallback[element] === "function") {
            SF.detachedCallback[element](this);
          }
        };
        document.registerElement(element, {prototype: proto});
      };
      link.onerror = function(e) {
        console.log(e);
      };
      document.head.appendChild(link);
    };
  },
  replaceBindData: function(target, data){
    Object.assign(data, tryParseJSON(target.dataset.bindOld), tryParseJSON(target.dataset.bind));
    let html = target.dataset.originalHtml;
    target.dataset.bindOld = JSON.stringify(data);
    html = SF.replaceHTML(html, data, '#{bind');
    target.shadowRoot.innerHTML = html;
  },
  replaceHTML: function(html, data, prefix){
    let replaced = prefix + '}';
    if (Array.isArray(data)) {
      html = html.replace(replaced, stringify(data));
      data.forEach(function(value, index){
        html = SF.replaceHTML(html, value, prefix + '[' + index + ']')
      });
    } else if (typeof data === "object") {
      html = html.replace(replaced, stringify(data));
      for (let key in data) {
        html = SF.replaceHTML(html, data[key], prefix + '.' + key)
        html = SF.replaceHTML(html, data[key], prefix + '[' + key + ']')
      }
    } else {
      let replaced = prefix + '}';
      html = html.replace(replaced, data);
    }
    return html;
  },
  defaultBind: {},
  createdCallback: {},
  attachedCallback: {},
  detachedCallback: {},
  attributeChangedCallback: {},
  setDataBind: function(target, json){
    target.dataset.bind = JSON.stringify(json);
  }
}
function forEach(array, callback) {
  if (typeof array == 'object' && array != null && array) {
    for (var key in array) {
      if (array.hasOwnProperty(key) && array[key] && key != "length") {
        callback.call(array[i], array[key], key);
      }
    }
  } else if(Array.isArray(array)) {
    if (array.length < 1) {
      return false;
    }
    for (var i = 0; i < array.length; i++) {
      callback.call(array[i], array[i], i);
    }
  } else {
    callback.call(array, array, 0);
  }
};
function stringify(data){
  return JSON.stringify(data).replace(new RegExp('"', 'g'),'&quot;')
}
function tryParseJSON(jsonString){
    try {
        var o = JSON.parse(jsonString);
        if (o && typeof o === "object") {
            return o;
        }
    }
    catch (e) {
      return {};
    }
    return {};
};