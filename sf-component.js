class SFComponent {
  constructor(element, href = null){
    href = typeof href === "string" ? href : '/elements/' + element + '.html';
    if(Array.isArray(element)){
      return element.map(e => new SFComponent(e));
    } else if (typeof element == 'object'){
      return Object.keys(element).map(k => new SFComponent(k, element[k]));
    }
    createComponent(element, href, this);
  }
  static replaceBindData(target){
    let element = target.tagName.toLowerCase();
    let c = SFComponent[element];
    if (!c) return;
    let bind = target.bind;
    this.replaceNode(c.originalNode.shadowRoot, target.shadowRoot, {bind: bind});
    if (typeof c.bindDataChangeCallback === "function") {
      c.bindDataChangeCallback(this);
    }
  }
  static replaceNode(originalNode, oldNode, {bind = {}, route = {}} = {}, {original = 'original'} = {}){
    if (!originalNode || !oldNode){
      return;
    }
    if (originalNode.nodeName !== oldNode.nodeName){
      oldNode.replaceWith(originalNode);
    }
    let originalChilds = originalNode.childNodes;
    let oldChilds = oldNode.childNodes;
    this.replaceAttribute(originalNode, oldNode, {bind: bind, route: route});
    if(originalNode.innerHTML == oldNode.innerHTML){
      oldNode[original] = true;
    }
    let replacing = [], j = 0;
    originalChilds.forEach((v, i) => {
      while (SFComponent.skip(oldChilds[j])){
        j++;
      }
      if (!oldChilds[j]){
        oldNode.appendChild(v);
        return;
      } else if(v.nodeType === 3){
        if (v.isEqualNode(oldChilds[j])){
          oldChilds[j][original] = true;
        }
        let val = v.nodeValue;
        replacing[i] = {replaced: oldChilds[j], replacer: document.createElement('sf-bind')};
        let newV = SFComponent.evaluateString(val, {bind: bind, route: route});
        replacing[i].replacer[original] = true;
        replacing[i].replacer.innerHTML = newV;
        const remove = replacing[i].replaced;
        const add = replacing[i].replacer.childNodes[0];
        if (replacing[i].replacer.childNodes.length === 1 && add.nodeType === 3){
          if (remove.nodeType === 3){
            if (remove.nodeValue != add.nodeValue) {
              remove.nodeValue = add.nodeValue;
            } else {
              remove[original] = true;
            }
          } else {
            remove.replaceWith(add);
          }
          replacing.splice(i, 1);
        } else if (remove.nodeType === 3){
          replacing[i].replacer.childNodes.forEach(v => v.bindel = true);
          remove.replaceWith(replacing[i].replacer);
          replacing.splice(i, 1);
        }
      } else {
        SFComponent.replaceNode(v, oldChilds[j], {bind: bind, route: route});
      }
      j++;
    });
    while (oldChilds[j]){
      if (!SFComponent.skip(oldChilds[j])){
        oldChilds[j].remove();
      } else {
        j++;
      }
    }
    replacing.forEach((v,i) => {
      SFComponent.replaceNode(v.replacer, v.replaced, {bind: bind, route: route}, {original: 'bindel'});
    });
  }
  static skip(el){
    return el && (el.skip || (el.dataset && el.dataset.skip));
  }
  static original(el, original){
    return el && (el[original] || (el.dataset && el.dataset.original));
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
    return string.replace(/\${([^{}]*({[^}]*})*[^{}]*)*}/g, replacer);
    function replacer(match) {
      let g1 = match.slice(2, -1);
      function executeCode(){
        let f, text;
        if (g1.search('return') >= 0){
          f = new Function('bind', 'route', g1);
        } else {
          f = new Function('bind', 'route', 'return ' + g1);
        }
        try {
          text = tryStringify(f(bind, route));
        } catch (e) {
          console.log(e);
          text = match;
        }
        return text;
      }
      return executeCode();
    }
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
  static twoWayBind(e){
    const target = e.composedPath()[0] || e.target;
    let host = target;
    while (host.nodeType != 11){
      host = host.parentNode;
      if (!host) return;
    }
    host = host.host;
    let val = target.value || target.innerHTML;
    let data = {};
    data[target.dataset.bindTo.slice(5)] = val.replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    host.bind = data;
  }
}

function createComponent(element, href, c){
  if(!element) {
    console.log(`Error creating element: No element name - ${element}.`);
    return;
  } else if (window.customElements.get(element)) {
    console.log(`Error creating element: Element (${element}) already defined.`);
    return;
  } else if (element.indexOf("-") < 1) {
    console.log(`Error creating element: Element name (${element}) must have one "-".`);
    return;
  } else if (SFComponent[element]) {
    console.log(`Error creating element: Element (${element}) declaration in process.`);
    return;
  }
  SFComponent[element] = c;
  let link = document.createElement('link');
  const cl = class extends HTMLElement {
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
        function replacer(match, g1) {
          return match.replace(g1, SFComponent.absolute(base, g1));
        }
        template.innerHTML = newHtml;
      }
      const shadowRoot = this.attachShadow({mode: 'open'})
        .appendChild(template.content.cloneNode(true));
      let x = document.createElement('body');
      x.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
      c.originalNode = x;
      if (typeof c.createdCallback === "function") {
        c.createdCallback(this);
      }
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
      if (attrName === "data-bind"){
        this.bind = tryParseJSON(newVal);
      }
      if (typeof c.attributeChangedCallback === "function") {
        c.attributeChangedCallback(this, attrName, oldVal, newVal);
      }
    }
    connectedCallback() {
      let defaultBind = c.defaultBind || {};
      let dataBind = tryParseJSON(this.dataset.bind) || {};
      this.bind = this.bind || {};
      this.bind = Object.assign(defaultBind, dataBind, this.bind);
      this.shadowRoot.addEventListener('change', SFComponent.twoWayBind);
      if (typeof c.connectedCallback === "function") {
        c.connectedCallback(this);
      }
    }
    disconnectedCallback() {
      if (typeof c.disconnectedCallback === "function") {
        c.disconnectedCallback(this);
      }
    }
  }
  link.rel = 'import';
  link.href = href;
  link.setAttribute('async', '');
  link.onload = function(e) {
    try {
      window.customElements.define(element, cl);
    } catch(e) {
      console.log(element, e);
      console.log(customElements.get(element));
    }
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
      return o;
    }
    catch (e) {
      return jsonString;
    }
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
    this.bindValue = this.bindValue || {};
    total = Object.assign(this.bindValue, v);
    SFComponent.replaceBindData(this);
  }
});
document.addEventListener('input', SFComponent.twoWayBind);
