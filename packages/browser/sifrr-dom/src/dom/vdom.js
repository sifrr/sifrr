class Vdom {
  static toVDOM(html, dom = false, state = false) {
    if (NodeList.prototype.isPrototypeOf(html) || Array.isArray(html)) {
      let ans = [];
      html.forEach(v => ans.push(SFComponent.toVDOM(v, dom, state)));
      return ans;
    } else if (html.nodeType === 3 || typeof html === 'string') {
      const x = html.nodeValue || html;
      return {
        tag: '#text',
        data: x,
        state: x.indexOf('${') > -1 || state
      }
    } else {
      let nstate = false;
      const attrs = html.attributes || {},
        l = attrs.length,
        attr = [];
      for (let i = 0; i < l; i++) {
        attr[attrs[i].name] = {
          value: attrs[i].value,
          state: attrs[i].value.indexOf('${') > -1 || state
        }
        if (attr[attrs[i].name].state) nstate = true;
      }
      let ans = {
        tag: html.nodeName,
        attrs: attr,
        children: SFComponent.toVDOM(html.childNodes, dom, state)
      }
      if (dom) ans.dom = html;
      ans.children.forEach(c => {
        if(c.state) nstate = true;
      });
      ans.state = state || nstate;
      return ans;
    }
  }

  static twoWayBind(e) {
    const target = e.composedPath() ? e.composedPath()[0] : e.target;
    target.setAttribute("value", target.value);
    if (!target.dataset || !target.dataset.bindTo) {
      return;
    }
    let host = target.getRootNode();
    let sr = host,
      range, startN, startO, endN, endO;
    if (!target.value) {
      range = sr.getSelection().getRangeAt(0).cloneRange();
      [startN, startO, endN, endO] = [range.startContainer, range.startOffset, range.endContainer, range.endOffset];
    }
    host = host.host;
    let data = {};
    data[target.dataset.bindTo] = typeof target.value === 'string' ? target.value :
      target.innerHTML.trim()
            .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
            .replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
    host.state = data;
    if (!target.value) {
      range.setStart(startN, startO);
      range.setEnd(endN, endO);
      sr.getSelection().removeAllRanges();
      sr.getSelection().addRange(range);
    }
  }

  static updateState(element) {
    // Implement
  }
}

module.exports = Vdom;
