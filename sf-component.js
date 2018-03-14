var bind, route, bind2;
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
  static replaceBindData(target, {bind2 = {}} = {}){
    let element = target.tagName.toLowerCase();
    let c = SFComponent[element];
    let html = SFComponent.replace(c.originalHTML, {bind: target.bind, bind2: bind2});
    if (target.shadowRoot && target.shadowRoot.innerHTML !== html){
      target.shadowRoot.innerHTML = html;
      if (typeof c.bindDataChangedCallback === "function") {
        c.bindDataChangedCallback(target, target.bind);
      }
    }
  }
  static clearbindData(target){
    target.bindValue = {};
    replaceBindData(target);
  }
  static replace(text, data){
    if(!text){
      return '';
    }
    bind = data.bind || {};
    route = data.route || {};
    bind2 = data.bind2 || {};
    text = text.replace(/#{([^{}]*({[^}]*})*[^{}]*)*}/g, replacer);
    function replacer(match) {
      let g1 = match.slice(2, -1);
      function executeCode(){
        let f, text;
        if (g1.search('return') >= 0){
          f = new Function(g1);
        } else {
          f = new Function('return ' + g1);
        }
        try {
          text = tryStringify(f());
        } catch (e) {
          text = match;
        }
        return text;
      }
      return executeCode();
    }
    return text;
  }
  static clearBindData(target){
    target.bind = {};
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
  static change(target, parent){
    let binder = target.dataset.binder;
    bind = {};
    let f = new Function(binder + ' = "' + target.value.replace(/"/g, "&quot;") + '";');
    f();
    parent.bind = bind;
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
          return c.observedAttributes;
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
            function replacer(match, g1) {
              return match.replace(g1, SFComponent.absolute(base, g1));
            }
            template.innerHTML = newHtml;
          }
          const shadowRoot = this.attachShadow({mode: 'open'})
            .appendChild(template.content.cloneNode(true));
          c.originalHTML = template.innerHTML;
          if (typeof c.createdCallback === "function") {
            c.createdCallback(this);
          }
        }
        attributeChangedCallback(attrName, oldVal, newVal) {
          if (typeof c.attributeChangedCallback === "function") {
            c.attributeChangedCallback(this, attrName, oldVal, newVal);
          }
        }
        connectedCallback() {
          let defaultBind = c.defaultBind || {};
          let bv = this.bind || {};
          this.bind = Object.assign(defaultBind, bv);
          if (typeof c.connectedCallback === "function") {
            c.connectedCallback(this);
          }
          let x = this;
          this.shadowRoot.addEventListener("change", function(e) {
            SFComponent.change(e.target, x);
          });
          this.shadowRoot.addEventListener("keyup", function(e) {
            SFComponent.change(e.target, x);
          });
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
function tryStringify(json){
  if (typeof json === "string"){
    return json;
  } else {
    return JSON.stringify(json);
  }
}
Object.defineProperty(HTMLElement.prototype, "bind", {
  get(){
    return this.bindValue;
  },
  set(v){
    bv = this.bindValue || {};
    total = Object.assign(bv, v);
    if (Object.keys(total).length > 0){
      this.bindValue = total;
      SFComponent.replaceBindData(this);
    }
  }
});
