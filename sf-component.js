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
  static updateState(target){
    let element = target.tagName.toLowerCase();
    let c = SFComponent[element];
    if (!c || !c.originalNode) return;
    let state = target.state;
    if (c.shadowRoot){
      SFComponent.replaceDOM(c.originalNode, target.shadowRoot, state);
    } else {
      SFComponent.replaceDOM(c.originalNode, target, state);
    }
    if (typeof c.stateChangeCallback === "function") {
      c.stateChangeCallback(this);
    }
  }
  static replaceDOM(original, old, state){
    if (!original || !old){
      return;
    }
    let replacer = SFComponent.evaluateDOM(original, state);
    this.replaceChildren(replacer.childNodes, old.childNodes, old);
  }
  static evaluateDOM(dom, state){
    if (!dom){
      return dom;
    }
    let ans = dom.cloneNode(true);
    SFComponent.evaluateAttributes(ans, state);
    if(ans.innerHTML.indexOf('${') < 0){
      return ans;
    }
    SFComponent.evaluateChildren(ans.childNodes, state);
    return ans;
  }
  static evaluateChildren(children, state){
    children.forEach(v => {
      if (v.nodeType === 3){
        if (v.nodeValue.indexOf('${') < 0) return;
        let replacing = SFComponent.evaluateString(v.nodeValue, state);
        if (!replacing) return;
        if (Array.isArray(replacing)){
          v.replaceWith(...replacing);
        } else if (replacing.nodeType) {
          v.replaceWith(replacing);
        } else {
          if (typeof replacing !== 'string') replacing = tryStringify(replacing);
          if (replacing.indexOf('<') < 0) {
            v.nodeValue = replacing;
          } else {
            let x = document.createElement('body');
            x.innerHTML = replacing;
            v.replaceWith(...x.childNodes);
          }
        }
      } else {
        SFComponent.evaluateAttributes(v, state);
        SFComponent.evaluateChildren(v.childNodes, state);
      }
    });
  }
  static evaluateAttributes(dom, state){
    let attrs = dom.attributes;
    if (!attrs){
      return;
    }
    for(let i = 0; i < attrs.length; i++){
      let v = attrs[i].value;
      let n = attrs[i].name;
      let newV = SFComponent.evaluateString(v, state);
      let newN = SFComponent.evaluateString(n, state);
      if (n === newN){
        if (newV !== dom.getAttribute(n)){
          dom.setAttribute(n, newV);
        }
      } else {
        dom.removeAttribute(n);
        dom.setAttribute(newN, newV);
      }
    }
  }
  static replaceNode(originalNode, oldNode){
    if (!originalNode || !oldNode){
      return;
    } else if (originalNode.nodeName !== oldNode.nodeName && originalNode.nodeName !== "#document-fragment"){
      oldNode.replaceWith(originalNode);
      return;
    } else if (originalNode.nodeType === 3) {
      if (oldNode.nodeValue !== originalNode.nodeValue) oldNode.nodeValue = originalNode.nodeValue;
      return;
    } else if (originalNode.nodeName === 'TEXTAREA') {
      oldNode.value = originalNode.value;
    } else if (originalNode.nodeName === 'SELECT') {
      oldNode.value = originalNode.getAttribute('value') || originalNode.value ;
    }
    if (originalNode.state) oldNode.state = originalNode.state;
    this.replaceAttribute(originalNode, oldNode);
    let originalChilds = originalNode.childNodes;
    let oldChilds = oldNode.childNodes;
    SFComponent.replaceChildren(originalChilds, oldChilds, oldNode);
  }
  static replaceChildren(originalChilds, oldChilds, parent){
    let j = 0;
    let frag = document.createDocumentFragment();
    originalChilds.forEach((v, i) => {
      while (SFComponent.skip(oldChilds[j])){
        j++;
      }
      if (v.dataset && v.dataset.key && oldChilds[j] && oldChilds[j].dataset && v.dataset.key !== oldChilds[j].dataset.key){
        if (oldChilds[j + 1] && oldChilds[j + 1].dataset && v.dataset.key === oldChilds[j + 1].dataset.key) oldChilds[j].remove();
      }
      if (!oldChilds[j]){
        let x = v.cloneNode(true);
        if (v.state) x.state = v.state;
        frag.appendChild(x);
        j++;
        return;
      } else if(v.nodeName !== oldChilds[j].nodeName){
        let x = v.cloneNode(true);
        if (v.state) x.state = v.state;
        parent.replaceChild(x, oldChilds[j]);
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
    if (frag.childNodes.length > 0){
      parent.appendChild(frag);
    }
  }
  static skip(el){
    return el && (el.skip || (el.dataset && el.dataset.skip));
  }
  static replaceAttribute(originalNode, oldNode){
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
  static evaluateString(string, state){
    if (string.indexOf('${') < 0) return string;
    string = string.trim();
    let binder = '';
    for (let i in state){
      binder += 'let ' + i + ' = this["' + i + '"]; ';
    }
    if (string.indexOf('${') === 0) return replacer(string);
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
        let f;
        if (g1.search('return') >= 0){
          f = new Function(binder + g1).bind(state);
        } else {
          f = new Function(binder + 'return ' + g1).bind(state);
        }
        try {
          return f();
        } catch (e) {
          return match;
        }
      }
      return executeCode();
    }
  }
  static clearState(target){
    target._state = {};
    updateState(target);
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
    let sr = host, range, startN, startO, endN, endO;
    if (!target.value){
      range = sr.getSelection().getRangeAt(0).cloneRange();
      [startN, startO, endN, endO] = [range.startContainer, range.startOffset, range.endContainer, range.endOffset];
    }
    host = host.host;
    let data = {};
    data[target.dataset.bindTo.replace(/this./g, '')] = typeof target.value === 'string' ? target.value : target.innerHTML.trim().replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>');
    host.state = data;
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
      let x = document.createElement('body');
      if (template.getAttribute('shadow-root') === "false"){
        x.appendChild(template.content.cloneNode(true));
        c.shadowRoot = false;
      } else {
        const shadowRoot = this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        x.appendChild(template.content.cloneNode(true));
        c.shadowRoot = true;
      }
      c.originalNode = x;
      if (typeof c.createdCallback === "function") {
        c.createdCallback(this);
      }
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
      if (attrName === "data-bind"){
        this.state = {bind: tryParseJSON(newVal)};
      }
      if (typeof c.attributeChangedCallback === "function") {
        c.attributeChangedCallback(this, attrName, oldVal, newVal);
      }
    }
    connectedCallback() {
      let defaultState = c.defaultState || {};
      let dataBind = tryParseJSON(this.dataset.bind) || {};
      let oldState = this.state;
      this.state = Object.assign(defaultState, {bind: dataBind}, oldState);
      if (this.shadowRoot) this.shadowRoot.addEventListener('change', SFComponent.twoWayBind);
      else this.addEventListener('change', SFComponent.twoWayBind);
      if (typeof c.connectedCallback === "function") {
        c.connectedCallback(this);
      }
    }
    disconnectedCallback() {
      if (typeof c.disconnectedCallback === "function") {
        c.disconnectedCallback(this);
      }
    }
    get state(){
      return this._state;
    }
    set state(v){
      this._state = this._state || {};
      Object.assign(this._state, v);
      SFComponent.updateState(this);
    }
    get key(){
      return this._key;
    }
    set key(v){
      this._key = v;
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
document.addEventListener('input', SFComponent.twoWayBind);
document.addEventListener('change', SFComponent.twoWayBind);
