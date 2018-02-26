Array.prototype.remove = function() {
  let what, a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};
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
    forEach(elements, function(element, href){
      let link = document.createElement('link');
      link.rel = 'import';
      link.href = typeof href === "string" ? href : '/elements/' + element + '.html';
      link.setAttribute('async', '');
      link.onload = function(e) {
        window.customElements.define(element,
          class extends HTMLElement {
            static get observedAttributes() {
              SF.observedAttributes[element] = SF.observedAttributes[element] ? SF.observedAttributes[element] : [];
              return ['data-bind'].concat(SF.observedAttributes[element]);
            }
            constructor() {
              super();
              const template = link.import.querySelector('template');
              if (template.getAttribute("relative-url") == "true") {
                var base = link.href;
                let insideHtml = template.innerHTML;
                let href_regex = /href=['"]?((?!http)[a-zA-z.\/\-\_]+)['"]?/g;
                let src_regex = /src=['"]?((?!http)[a-zA-z.\/\-\_]+)['"]?/g;
                let newHtml = insideHtml.replace(href_regex, replacer);
                newHtml = newHtml.replace(src_regex, replacer);
                function replacer(match, g1, offset, string) {
                  return match.replace(g1, SF.absolute(base, g1));
                }
                template.innerHTML = newHtml;
              }
              const shadowRoot = this.attachShadow({mode: 'open'})
                .appendChild(template.content.cloneNode(true));
              if (typeof SF.createdCallback[element] === "function") {
                SF.createdCallback[element](this);
              }
            }
            attributeChangedCallback(attrName, oldVal, newVal) {
              if (typeof SF.attributeChangedCallback[element] === "function") {
                SF.attributeChangedCallback[element](this, attrName, oldVal, newVal);
              }
              if (attrName == "data-bind") {
                let html = SF.replaceBindData(this, {}, element);
              }
            }
            connectedCallback() {
              let defaultBind = SF.defaultBind[element] ? SF.defaultBind[element] : {};
              SF.replaceBindData(this, defaultBind, element);
              if (typeof SF.connectedCallback[element] === "function") {
                SF.connectedCallback[element](this);
              }
            }
            disconnectedCallback() {
              if (typeof SF.disconnectedCallback[element] === "function") {
                SF.disconnectedCallback[element](this);
              }
            }
        });
      };
      link.onerror = function(e) {
        console.log(e);
      };
      document.head.appendChild(link);
    });
  },
  replaceBindData: function(target, data, element){
    if (typeof target.dataset.originalHtml === 'undefined') {
      let html = target.shadowRoot.innerHTML;
      target.dataset.originalHtml = html.replace(/\<\!--\s*?[^\s?\[][\s\S]*?--\>/g,'')
                                      .replace(/\>\s*\</g,'><');
    }
    if (typeof target.dataset.bind === 'undefined') {
      target.dataset.bind = JSON.stringify({});
    }
    Object.assign(data, tryParseJSON(target.dataset.bindOld), tryParseJSON(target.dataset.bind));
    if(target.dataset.bindOld == data){
      return;
    }
    let html = target.dataset.originalHtml;
    target.dataset.bindOld = JSON.stringify(data);
    html = SF.replaceHTML(html, data, '#{bind');
    target.shadowRoot.innerHTML = html;
    if (typeof SF.bindDataChangedCallback[element] === "function") {
      SF.bindDataChangedCallback[element](target, data);
    }
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
  connectedCallback: {},
  disconnectedCallback: {},
  attributeChangedCallback: {},
  bindDataChangedCallback: {},
  observedAttributes: {},
  setBindData: function(target, json){
    target.dataset.bind = JSON.stringify(json);
  },
  absolute: function(base, relative) {
    var stack = base.split("/"),
        parts = relative.split("/");
    stack.pop();
    for (let i=0; i<parts.length; i++) {
        if (parts[i] == ".")
            continue;
        if (parts[i] == "..")
            stack.pop();
        else
            stack.push(parts[i]);
    }
    return stack.join("/");
  },
  getRoutes: function(url){
    if (url[0] != '/') {
      url = '/' + url;
    }
    let qIndex = url.indexOf("?");
    if (qIndex != -1)
    {
        url = url.substring(0, qIndex);
    }
    return url.split("/");
  }
}
function forEach(array, callback) {
  if(Array.isArray(array)) {
    if (array.length < 1) {
      return false;
    }
    for (var i = 0; i < array.length; i++) {
      callback.call(array[i], array[i], i);
    }
  } else if (typeof array == 'object' && array != null && array) {
    for (var key in array) {
      if (array.hasOwnProperty(key) && array[key] && key != "length") {
        callback.call(array[key], key, array[key]);
      }
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
function addClass(elem, classN) {
  if (typeof elem == "string") {
    elem = document.querySelector(elem);
  }
  if (!elem) {
    return false;
  }
  if (elem.className.length < 1) {
    elem.className = classN;
  }
  let classes = elem.className.split(" ");
  if (classes.indexOf(classN) < 0) {
    classes.push(classN);
  }
  elem.className = classes.join(" ");
}

function removeClass(elem, classN) {
  if (typeof elem == "string") {
    elem = document.querySelector(elem);
  }
  if (!elem) {
    return false;
  }
  let classes = elem.className.split(" ");
  classes.remove(classN);
  elem.className = classes.join(" ");
}