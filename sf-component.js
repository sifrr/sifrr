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
    if (c.sr){
      SFComponent.replaceNode(target.shadowRoot, c.originalNode, state);
    } else {
      SFComponent.replaceNode(target, c.originalNode, state);
    }
    if (typeof c.stateChangeCallback === "function") {
      c.stateChangeCallback(this);
    }
  }
  static toVDOM(html){
    if (NodeList.prototype.isPrototypeOf(html) || Array.isArray(html)){
      let ans = [];
      html.forEach(v => ans.push(SFComponent.toVDOM(v)));
      return ans;
    } else if (html.nodeType === 3) {
      return { tag: html.nodeName,
               data: html.nodeValue,
               state: html.nodeValue.indexOf('${') > -1};
    } else {
      const attrs = html.attributes || {}, l = attrs.length, attr = [];
      for(let i = 0; i < l; i++){
        attr[i] = {
          name: {
            data: attrs[i].name,
            state: attrs[i].name.indexOf('${') > -1
          },
          value: {
            data: attrs[i].value,
            state: attrs[i].value.indexOf('${') > -1
          }
        };
      }
      let ans = {
        tag: html.nodeName,
        attrs: attr,
        children: SFComponent.toVDOM(html.childNodes)
      };
      return ans;
    }
  }
  static toHTML(node){
    if (Array.isArray(node)){
      return node.map(v => SFComponent.toHTML(v));
    } else if (!node) {
      return node;
    } else {
      let html;
      switch(node.tag){
        case '#text':
          html = document.createTextNode(node.value);
          break;
        default:
          html = document.createElement(node.tag);
          node.attrs.forEach(a => {
            html.setAttribute(a.name.data, a.value.data);
          });
          SFComponent.toHTML(node.children).forEach(c => html.appendChild(c));
          break;
      }
      return html;
    }
  }
  static replaceNode(domnode, vnode, state){
    if (!domnode || !vnode){
      return;
    } else if (vnode.tag !== domnode.nodeName && vnode.tag !== "#document-fragment"){
      domnode.replaceWith(SFComponent.toHTML(vnode));
      return;
    }
    this.replaceAttributes(domnode, vnode);
    console.log(domnode.childNodes, vnode.children);
    this.replaceChildren(domnode.childNodes, vnode.children, domnode);
  }
  static replaceAttributes(domnode, vnode, state){
    if (!vnode.attrs){
      return;
    }
    vnode.attrs.forEach(a => {
      let v = a.value.data;
      let n = a.name.data;
      if (a.value.state) v = SFComponent.evaluateString(v, state);
      if (a.name.state){
        n = SFComponent.evaluateString(n, state);
        domnode.removeAttribute(a.name.data);
        domnode.setAttribute(n, v);
      } else if (v !== a.value.data) {
        domnode.setAttribute(n, v);
      }
    });
  }
  static replaceChildren(doms, vnodes, state){
    if (!vnodes) return;
    let j = 0;
    let frag = [];
    let replaced = [];
    vnodes.forEach((v, i) => {
      while (SFComponent.skip(doms[j])){
        j++;
      }
      // if (v.dataset && v.dataset.key && doms[j] && doms[j].dataset && v.dataset.key !== doms[j].dataset.key){
      //   if (doms[j + 1] && doms[j + 1].dataset && v.dataset.key === doms[j + 1].dataset.key) doms[j].remove();
      // }
      if (!doms[j]){
        frag.push(v);
        j++;
        return;
      } else if (v.tag === '#text'){
        if (!v.state) return;
        replaced.push({
          dom: doms[j],
          replacing: SFComponent.evaluateString(v.data, state)
        });
      } else {
        SFComponent.replaceNode(doms[j], v, state);
      }
      j++;
    });
    while (doms[j]){
      if (!SFComponent.skip(doms[j])){
        doms[j].remove();
      } else {
        j++;
      }
    }
    replaced.forEach(v => {
      if (!v.replacing) return;
      if (Array.isArray(v.replacing)){
        v.dom.replaceWith(...v.replacing);
      } else if (v.replacing.nodeType) {
        v.dom.replaceWith(v.replacing);
      } else {
        if (typeof v.replacing !== 'string') v.replacing = tryStringify(replacing);
        if (v.replacing.indexOf('<') < 0) {
          v.dom.nodeValue = v.replacing;
        } else {
          let x = document.createElement('body');
          x.innerHTML = v.replacing;
          v.replaceWith(...x.childNodes);
        }
      }
    });
    if (frag.length > 0){
      parent.appendChild(...SFComponent.toHTML(frag));
    }
  }
  static skip(el){
    return el && (el.skip || (el.dataset && el.dataset.skip));
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
      if (template.getAttribute('shadow-root') === "false"){
        c.sr = false;
      } else {
        const shadowRoot = this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        c.sr = true;
      }
      c.originalNode = SFComponent.toVDOM(template.content.cloneNode(true));
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
    clone(deep = true) {
      let ans = this.cloneNode(deep);
      ans.key = this.key;
      ans.state = this.state;
      return ans;
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
function stringify(data) {
  return JSON.stringify(data).replace(new RegExp('"', 'g'),'&quot;')
}
function tryParseJSON(jsonString) {
    try {
      var o = JSON.parse(jsonString);
      return o;
    }
    catch (e) {
      return jsonString;
    }
}
function tryStringify(json) {
  if (typeof json === "string"){
    return json;
  } else {
    return JSON.stringify(json);
  }
}
document.addEventListener('input', SFComponent.twoWayBind);
document.addEventListener('change', SFComponent.twoWayBind);
