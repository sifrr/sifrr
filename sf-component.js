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
  static replaceBindData(target){
    let element = target.tagName.toLowerCase();
    let c = SFComponent[element];
    let bind = target.bind;
    this.replaceNode(c.originalNode, target.shadowRoot, {bind: bind});
    if (typeof c.bindDataChangeCallback === "function") {
      c.bindDataChangeCallback(this);
    }
  }
  static replaceNode(originalNode, oldNode, {bind = {}, route = {}} = {}){
    if (!originalNode){
      return;
    }
    let originalChilds = originalNode.childNodes;
    let oldChilds = oldNode.childNodes;
    this.replaceAttribute(originalNode, oldNode, {bind: bind, route: route});
    if(originalNode.innerHTML == oldNode.innerHTML){
      oldNode.original = true;
      originalChilds.forEach(function(v, i){
        if(v.nodeType === 3){
          let val = v.nodeValue;
          if (val.length > 3) {
            let newV = SFComponent.evaluateString(val, {bind: bind, route: route});
            if (newV != oldChilds[i].nodeValue){
              let body = document.createElement('body');
              body.innerHTML = newV;
              oldChilds[i].replaceWith(...body.childNodes);
            }
          }
        } else {
          SFComponent.replaceNode(v, oldChilds[i], {bind: bind, route: route});
        }
      });
    } else {
      originalChilds.forEach(function(v, i){
        if(v.nodeType === 3){
          let val = v.nodeValue;
          if (val.length > 3) {
            while (oldChilds[i].nodeValue == "\n  "){
              oldNode.removeChild(oldChilds[i]);
            }
            let newV = SFComponent.evaluateString(val, {bind: bind, route: route});
            if (newV != oldChilds[i].nodeValue){
              let body = document.createElement('body');
              body.innerHTML = newV;
              while(oldChilds[i + 1] && !oldChilds[i + 1].original){
                oldNode.removeChild(oldChilds[i + 1]);
              }
              oldChilds[i].replaceWith(...body.childNodes);
            }
          }
        } else {
          SFComponent.replaceNode(v, oldChilds[i], {bind: bind, route: route});
        }
      });
    }
  }
  static replaceAttribute(originalNode, oldNode, {bind = {}, route = {}} = {}){
    let originalAttributes = originalNode.attributes;
    if (!originalAttributes){
      return;
    }
    for(let i = 0; i < originalAttributes.length; i++){
      let v = originalAttributes[i].value;
      let n = originalAttributes[i].name;
      let newV = SFComponent.evaluateString(v, {bind: bind, route: route});
      let newN = SFComponent.evaluateString(n, {bind: bind, route: route});
      if (n === newN){
        if (newV !== oldNode.getAttribute(n)){
          oldNode.setAttribute(n, newV);
        }
      } else {
        oldNode.removeAttribute(n);
        if (newV !== oldNode.getAttribute(newN)){
          oldNode.setAttribute(newN, newV);
        }
      }
    }
  }
  static evaluateString(string, {bind = {}, route = {}} = {}){
    let ans;
    try {
      ans = eval('`' + string + '`');
    } catch(e) {
      ans = string;
    }
    if (typeof ans === undefined){
      return string;
    }
    return ans;
  }
  static clearbindData(target){
    target.bindValue = {};
    replaceBindData(target);
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
  static createVirtualDOM(html){
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
          let x = document.createElement('body');
          x.appendChild(template.content.cloneNode(true));
          c.originalNode = x;
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
          if (typeof c.connectedCallback === "function") {
            c.connectedCallback(this);
          }
          let defaultBind = c.defaultBind || {};
          let bv = this.bind || {};
          this.bind = Object.assign(defaultBind, bv);
          let x = this;
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
