class SFComponent {
  constructor(element, href){
    if(Array.isArray(element)){
      return element.map(e => new SFComponent(e));
    } else if (typeof element == 'object'){
      return Object.keys(element).map(k => new SFComponent(k, element[k]));
    }
    createComponent(element, href, this);
    SFComponent[element] = this;
  }
}

function createComponent(element, href, c){
  let link = document.createElement('link');
  link.rel = 'import';
  link.href = typeof href === "string" ? href : '/elements/' + element + '.html';
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
  }
  link.onerror = function(e) {
    console.log(e);
  }
  document.head.appendChild(link);
}