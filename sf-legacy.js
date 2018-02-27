'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Array.prototype.remove = function () {
  var what = void 0,
      a = arguments,
      L = a.length,
      ax = void 0;
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
    getHTTP: function getHTTP(url, params, callback, failure, type) {
      params = typeof params == 'undefined' ? {} : params;
      var ans = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }).join('&'),
          noload = false;
      var http = new XMLHttpRequest(),
          lfres = void 0;
      http.onload = function () {
        if (http.status > 199 && http.status < 400) {
          var result = JSON.parse(http.responseText);
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
      http.onerror = function (e) {
        if (!noload) {
          Console.log("Network Error, try again.");
        }
      };
      http.ontimeout = function (e) {
        if (!noload) {
          Console.log('Request timed out');
        }
      };
      http.onprogress = function (e) {};
      http.open(type, url + '?' + ans, true);
      http.setRequestHeader("accept", "application/json");
      http.send();
    },
    get: function get(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "GET");
    },
    post: function post(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "POST");
    },
    put: function put(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "PUT");
    },
    delete: function _delete(url, params, callback, failure) {
      return SF.API.getHTTP(url, params, callback, failure, "DELETE");
    }
  },
  loadCustomElement: function loadCustomElement(elements) {
    forEach(elements, function (element, href) {
      var link = document.createElement('link');
      link.rel = 'import';
      link.href = typeof href === "string" ? href : '/elements/' + element + '.html';
      link.setAttribute('async', '');
      link.onload = function (e) {
        window.customElements.define(element, function (_HTMLElement) {
          _inherits(_class, _HTMLElement);

          _createClass(_class, null, [{
            key: 'observedAttributes',
            get: function get() {
              SF.observedAttributes[element] = SF.observedAttributes[element] ? SF.observedAttributes[element] : [];
              return ['data-bind'].concat(SF.observedAttributes[element]);
            }
          }]);

          function _class() {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this));

            var template = link.import.querySelector('template');
            if (template.getAttribute("relative-url") == "true") {
              var replacer = function replacer(match, g1, offset, string) {
                return match.replace(g1, SF.absolute(base, g1));
              };

              var base = link.href;
              var insideHtml = template.innerHTML;
              var href_regex = /href=['"]?((?!http)[a-zA-z.\/\-\_]+)['"]?/g;
              var src_regex = /src=['"]?((?!http)[a-zA-z.\/\-\_]+)['"]?/g;
              var newHtml = insideHtml.replace(href_regex, replacer);
              newHtml = newHtml.replace(src_regex, replacer);

              template.innerHTML = newHtml;
            }
            var shadowRoot = _this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
            if (typeof SF.createdCallback[element] === "function") {
              SF.createdCallback[element](_this);
            }
            return _this;
          }

          _createClass(_class, [{
            key: 'attributeChangedCallback',
            value: function attributeChangedCallback(attrName, oldVal, newVal) {
              if (typeof SF.attributeChangedCallback[element] === "function") {
                SF.attributeChangedCallback[element](this, attrName, oldVal, newVal);
              }
              if (attrName == "data-bind") {
                var _html = SF.replaceBindData(this, {}, element);
              }
            }
          }, {
            key: 'connectedCallback',
            value: function connectedCallback() {
              var defaultBind = SF.defaultBind[element] ? SF.defaultBind[element] : {};
              SF.replaceBindData(this, defaultBind, element);
              if (typeof SF.connectedCallback[element] === "function") {
                SF.connectedCallback[element](this);
              }
            }
          }, {
            key: 'disconnectedCallback',
            value: function disconnectedCallback() {
              if (typeof SF.disconnectedCallback[element] === "function") {
                SF.disconnectedCallback[element](this);
              }
            }
          }]);

          return _class;
        }(HTMLElement));
      };
      link.onerror = function (e) {
        console.log(e);
      };
      document.head.appendChild(link);
    });
  },
  replaceBindData: function replaceBindData(target, data, element) {
    if (typeof target.dataset.originalHtml === 'undefined') {
      var _html2 = target.shadowRoot.innerHTML;
      target.dataset.originalHtml = _html2.replace(/\<\!--\s*?[^\s?\[][\s\S]*?--\>/g, '').replace(/\>\s*\</g, '><');
    }
    Object.assign(data, tryParseJSON(target.dataset.bindOld), tryParseJSON(target.dataset.bind));
    if (target.dataset.bindOld == data) {
      return;
    }
    target.dataset.bindOld = JSON.stringify(data);
    html = SF.replaceHTML(target.dataset.originalHtml, data, '#{bind');
    if (target.shadowRoot.innerHTML !== html) {
      target.shadowRoot.innerHTML = html;
    }
    if (typeof SF.bindDataChangedCallback[element] === "function") {
      SF.bindDataChangedCallback[element](target, data);
    }
  },
  replaceHTML: function replaceHTML(html, data, prefix) {
    if (!html) {
      return '';
    }
    var replaced = prefix + '}';
    if (Array.isArray(data)) {
      html = html.replace(replaced, stringify(data));
      data.forEach(function (value, index) {
        html = SF.replaceHTML(html, value, prefix + '[' + index + ']');
      });
    } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === "object") {
      html = html.replace(replaced, stringify(data));
      for (var key in data) {
        html = SF.replaceHTML(html, data[key], prefix + '.' + key);
        html = SF.replaceHTML(html, data[key], prefix + '[' + key + ']');
      }
    } else {
      var _replaced = prefix + '}';
      html = html.replace(_replaced, data);
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
  setBindData: function setBindData(target, json) {
    target.dataset.bind = JSON.stringify(json);
  },
  getBindData: function getBindData(target) {
    var data = {};
    Object.assign(data, tryParseJSON(target.dataset.bindOld), tryParseJSON(target.dataset.bind));
    return data;
  },
  absolute: function absolute(base, relative) {
    var stack = base.split("/"),
        parts = relative.split("/");
    stack.pop();
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] == ".") continue;
      if (parts[i] == "..") stack.pop();else stack.push(parts[i]);
    }
    return stack.join("/");
  },
  getRoutes: function getRoutes(url) {
    if (url[0] != '/') {
      url = '/' + url;
    }
    var qIndex = url.indexOf("?");
    if (qIndex != -1) {
      url = url.substring(0, qIndex);
    }
    return url.split("/");
  },
  clickEvents: {}
};
function forEach(array, callback) {
  if (Array.isArray(array)) {
    if (array.length < 1) {
      return false;
    }
    for (var i = 0; i < array.length; i++) {
      callback.call(array[i], array[i], i);
    }
  } else if ((typeof array === 'undefined' ? 'undefined' : _typeof(array)) == 'object' && array != null && array) {
    for (var key in array) {
      if (array.hasOwnProperty(key) && array[key] && key != "length") {
        callback.call(array[key], key, array[key]);
      }
    }
  } else {
    callback.call(array, array, 0);
  }
};
function stringify(data) {
  return JSON.stringify(data).replace(new RegExp('"', 'g'), '&quot;');
}
function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);
    if (o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === "object") {
      return o;
    }
  } catch (e) {
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
  var classes = elem.className.split(" ");
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
  var classes = elem.className.split(" ");
  classes.remove(classN);
  elem.className = classes.join(" ");
}
//Click event listner
var MAIN = document.body || document.getElementsByTagName("body")[0];
function clickHandler(e) {
  e = e || window.event;
  var target;
  target = e.target || e.srcElement;
  for (var k in SF.clickEvents) {
    x = target;
    while (x) {
      if (x.matches(k)) {
        var fn = SF.clickEvents[k];
        if (typeof fn === "function") {
          fn(x, e);
        }
      }
      if (x) {
        x = x.parentElement;
      }
    }
  }
}

if (MAIN.addEventListener) {
  MAIN.addEventListener('click', clickHandler, false);
} else {
  MAIN.attachEvent('onclick', clickHandler);
}