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
    if (!c || !c.originalNode) return;
    let bind = target.bind;
    SFComponent.replaceDOM(c.originalNode.shadowRoot, target.shadowRoot, {bind: bind})
    if (typeof c.bindDataChangeCallback === "function") {
      c.bindDataChangeCallback(this);
    }
  }
  static replaceDOM(original, old, {bind = {}, route = {}}){
    if (!original || !old){
      return;
    }
    let replacer = document.createElement('sf-element');
    replacer.innerHTML = SFComponent.evaluateString(original.innerHTML, {bind: bind, route: route});
    this.replaceChildren(replacer.childNodes, old.childNodes, old);
  }
  static replaceNode(originalNode, oldNode){
    if (!originalNode || !oldNode){
      return;
    }
    if (originalNode.nodeName !== oldNode.nodeName && oldNode.nodeName !== "#document-fragment"){
      oldNode.replaceWith(originalNode);
      return;
    } else if (originalNode.nodeType === 3) {
      if (oldNode.nodeValue !== originalNode.nodeValue) oldNode.nodeValue = originalNode.nodeValue;
      return;
    } else if (originalNode.nodeName === 'textarea') {
      oldNode.value = originalNode.value;
    } else if (originalNode.nodeName === 'select') {
      oldNode.value = originalNode.getAttribute('value') || originalNode.value ;
    }
    this.replaceAttribute(originalNode, oldNode);
    let originalChilds = originalNode.childNodes;
    let oldChilds = oldNode.childNodes;
    SFComponent.replaceChildren(originalChilds, oldChilds, oldNode);
  }
  static replaceChildren(originalChilds, oldChilds, parent){
    let j = 0;
    originalChilds.forEach((v, i) => {
      while (SFComponent.skip(oldChilds[j])){
        j++;
      }
      if (!oldChilds[j]){
        parent.appendChild(v.cloneNode(true));
        j++;
        return;
      } else if(v.nodeName !== oldChilds[j].nodeName){
        i = SFComponent.searchNext(v, oldChilds, j);
        if (i > 0){
          parent.insertBefore(oldChilds[i], oldChilds[j]);
          SFComponent.replaceNode(v, oldChilds[j]);
        } else {
          parent.insertBefore(v.cloneNode(true), oldChilds[j]);
        }
      } else {
        SFComponent.replaceNode(v, oldChilds[j]);
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
  }
  static searchNext(child, children, j){
    let key = -1, node = -1, i = j || 0;
    if (child.dataset && child.dataset.key) {
      while (i < children.length){
        if (children[i].dataset && children[i].dataset.key == child.dataset.key){
          key = i;
          break;
        }
        i++;
      }
      return key;
    } else {
      i = j;
      while (i < children.length){
        if (child.nodeName == children[i].nodeName){
          node = i;
          break;
        }
        i++;
      }
      return node;
    }
  }
  static skip(el){
    return el && (el.skip || (el.dataset && el.dataset.skip));
  }
  static replaceAttribute(originalNode, oldNode, {bind = {}, route = {}} = {}){
    let originalAttributes = originalNode.attributes;
    if (!originalAttributes){
      return;
    }
    for(let i = 0; i < originalAttributes.length; i++){
      let v = originalAttributes[i].value;
      let n = originalAttributes[i].name;
      if (v !== oldNode.getAttribute(n)){
        oldNode.setAttribute(n, v);
      }
    }
  }
  static evaluateString(string, {bind = {}, route = {}} = {}){
    return string.replace(/&[^;]+;/g, function(match) {
                   let map = {
                     '&lt;': '<',
                     '&#x3C;': '<',
                     '&gt;': '>',
                     '&#x3E;': '>'
                   }
                   return map[match] ? map[match] : match;
            		 }).replace(/\${([^{}]*({[^}]*})*[^{}]*)*}/g, replacer);
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
    if (!target.dataset || !target.dataset.bindTo){
      return;
    }
    let host = target;
    while (host.nodeType != 11){
      host = host.parentNode;
      if (!host) return;
    }
    let sr = host, range = sr.getSelection().getRangeAt(0).cloneRange();
    let [startN, startO, endN, endO] = [range.startContainer, range.startOffset, range.endContainer, range.endOffset];
    host = host.host;
    let data = {};
    data[target.dataset.bindTo.slice(5)] = typeof target.value === 'string' ? target.value : target.innerHTML.trim();
    host.bind = data;
    if (!target.value){
      range.setStart(startN, startO);
      range.setEnd(endN, endO);
      sr.getSelection().removeAllRanges();
      sr.getSelection().addRange(range);
    }
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
