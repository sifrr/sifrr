class Vdom {
  constructor(element, html) {
    this.baseElement = element;
    this.html = html;
    this.originalVdom = Vdom.toVdom(html);
  }

  updateState() {

  }

  newVdom() {

  }

  static toVdom(html) {
    // children
    if (Array.isArray(html)) {
      let ret = [];
      while(html.length) {
        ret.push(Vdom.toVdom(html.shift()));
      }
      return ret;
    }

    // text node and sifrr-node
    if (html.nodeType === 3) {
      return {
        tag: '#text',
        data: html.nodeValue,
        dom: html
      };
    }

    // attributes
    const attrs = html.attributes || [], l = attrs.length;
    let attr = {};
    for(let i = 0; i < l; i++) {
      attr[attrs[i].name] = attrs[i].value;
    }

    // children
    return {
      tag: html.nodeName,
      attrs: attr,
      children: Vdom.toVdom(Array.prototype.slice.call(html.childNodes)),
      dom: html
    };
  }

  static toHtml(vdom) {
    if (!vdom) {
      return vdom;
    }

    if (Array.isArray(vdom)) {
      let ret = [];
      while(vdom.length) {
        ret.push(Vdom.toHtml(vdom.shift()));
      }
      return ret;
    }

    if (vdom.dom) return vdom.dom;

    let html;
    switch (vdom.tag) {
    case '#text':
      html = document.createTextNode(vdom.data);
      break;
    case '#comment':
      html = document.createComment('comment');
      break;
    default:
      html = document.createElement(vdom.tag);
      for (let name in vdom.attrs) {
        html.setAttribute(name, vdom.attrs[name]);
      }
      html.append(...Vdom.toHtml(vdom.children));
      break;
    }
    return html;
  }
}

module.exports = Vdom;
