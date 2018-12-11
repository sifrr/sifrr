const Vdom = {
  toVDOM: function(html) {
    // parent state
    let state = false, attrState = false;

    // children
    if (Array.isArray(html)) {
      let ret = [];
      while(html.length) {
        ret.push(Vdom.toVDOM(html.shift()));
      }
      return ret;
    }

    // text node and sifrr-node
    if (html.nodeType === 3) {
      const x = html.nodeValue;
      if (x.indexOf('${') > -1) {
        let sn = window.document.createElement('sifrr-node');
        sn.appendChild(window.document.createTextNode(x));
        html.replaceWith(sn);
        return {
          tag: 'sifrr-node',
          data: x,
          state: true,
          dom: sn
        };
      } else {
        return {
          tag: '#text',
          data: x,
          state: false,
          dom: html
        };
      }
    }

    // attributes
    const attrs = html.attributes || [], l = attrs.length;
    let attr = [];
    for(let i = 0; i < l; i++) {
      let attribute = attrs[i];
      attr[attribute.name] = {
        value: attribute.value,
        state: attribute.value.indexOf('${') > -1
      };
      if (attr[attribute.name].state) attrState = true;
    }

    // children
    let ans = {
      tag: html.nodeName,
      attrs: attr,
      children: Vdom.toVDOM(Array.prototype.slice.call(html.childNodes)),
      dom: html
    };
    const len = ans.children.length;
    for (let i = 0; i < len; i++) {
      if (ans.children[i].state) state = true;
    }

    // parent
    ans.state = state;
    ans.attrState = attrState;
    return ans;
  },
  toHTML: function(node, frag = false) {
    if (Array.isArray(node)) {
      if (frag) {
        let x = document.createDocumentFragment();
        node.forEach(v => x.appendChild(Vdom.toHTML(v)));
        return x;
      } else {
        return node.map(v => Vdom.toHTML(v));
      }
    } else if (!node) {
      return node;
    } else {
      if (node.dom) return node.dom;
      let html;
      switch (node.tag) {
      case '#text':
        html = document.createTextNode(node.data);
        break;
      case '#comment':
        html = document.createComment('comment');
        break;
      default:
        html = document.createElement(node.tag);
        for (let name in node.attrs) {
          html.setAttribute(name, node.attrs[name].value);
        }
        Vdom.toHTML(node.children).forEach(c => html.appendChild(c));
        break;
      }
      return html;
    }
  }
}

module.exports = Vdom;
