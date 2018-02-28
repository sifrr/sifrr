class SFComponent {
  constructor(element, href = null){
    href = typeof href === "string" ? href : '/elements/' + element + '.html';
    if(Array.isArray(element)){
      return element.map(e => new SFComponent(e));
    } else if (typeof element == 'object'){
      return Object.keys(element).map(k => new SFComponent(k, element[k]));
    }
    createComponent(element, href, this);
    SFComponent[element] = this;
  }
  static replaceBindData(target, data, element = ''){
    let html = target.shadowRoot.innerHTML;
    if (typeof target.dataset.originalHtml === 'undefined') {
      target.dataset.originalHtml = html.replace(/\<\!--\s*?[^\s?\[][\s\S]*?--\>/g,'')
                                      .replace(/\>\s*\</g,'><');
    }
    data = SFComponent.getBindData(target, data);
    if(target.dataset.bindOld == data){
      return;
    }
    target.dataset.bindOld = JSON.stringify(data);
    html = SFComponent.replace(target.dataset.originalHtml, data, '#{bind');
    if (target.shadowRoot.innerHTML !== html){
      target.shadowRoot.innerHTML = html;
    }
    let c = SFComponent[element];
    if (typeof c.bindDataChangedCallback === "function") {
      c.bindDataChangedCallback(target, data);
    }
  }
  static replace(text, data, prefix){
    if(!text){
      return '';
    }
    let replaced = prefix + '}';
    if (Array.isArray(data)) {
      text = text.replace(replaced, stringify(data));
      data.forEach(function(value, index){
        text = SFComponent.replace(text, value, prefix + '[' + index + ']')
      });
    } else if (typeof data === "object") {
      text = text.replace(replaced, stringify(data));
      for (let key in data) {
        text = SFComponent.replace(text, data[key], prefix + '.' + key)
        text = SFComponent.replace(text, data[key], prefix + '[' + key + ']')
      }
    } else {
      let replaced = prefix + '}';
      text = text.replace(replaced, data);
    }
    return text;
  }
  static setBindData(target, json){
    console.log(target, json);
    target.dataset.bind = JSON.stringify(json);
  }
  static getBindData(target, data = {}){
    Object.assign(data, tryParseJSON(target.dataset.bindOld), tryParseJSON(target.dataset.bind));
    return data;
  }
  static absolute(base, relative) {
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
  }
  static getRoutes(url){
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

function createComponent(element, href, c){
  let link = document.createElement('link');
  link.rel = 'import';
  link.href = href;
  link.setAttribute('async', '');
  link.onload = function(e) {
    window.customElements.define(element,
      class extends HTMLElement {
        static get observedAttributes() {
          c.observedAttributes = c.observedAttributes || [];
          return ['data-bind'].concat(c.observedAttributes);
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
              return match.replace(g1, SFComponent.absolute(base, g1));
            }
            template.innerHTML = newHtml;
          }
          const shadowRoot = this.attachShadow({mode: 'open'})
            .appendChild(template.content.cloneNode(true));
          if (typeof c.createdCallback === "function") {
            c.createdCallback(this);
          }
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
          if (typeof c.attributeChangedCallback === "function") {
            c.attributeChangedCallback(this, attrName, oldVal, newVal);
          }
          if (attrName == "data-bind") {
            let text = SFComponent.replaceBindData(this, {}, element);
          }
        }
        connectedCallback() {
          let defaultBind = c.defaultBind ? c.defaultBind : {};
          SFComponent.replaceBindData(this, defaultBind, element);
          if (typeof c.connectedCallback === "function") {
            c.connectedCallback(this);
          }
        }
        disconnectedCallback() {
          if (typeof c.disconnectedCallback === "function") {
            c.disconnectedCallback(this);
          }
        }
    });
  }
  link.onerror = function(e) {
    console.log(e);
  }
  document.head.appendChild(link);
}
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
}