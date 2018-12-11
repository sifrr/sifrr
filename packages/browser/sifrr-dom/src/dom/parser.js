const Parser = {
  createStateMap: function(html) {
    // Empty map
    let nodes = [], attributes = [];

    // children
    if (Array.isArray(html)) {
      while(html.length) {
        const map = Parser.createStateMap(html.shift());
        Array.prototype.push.apply(nodes, map.nodes);
        Array.prototype.push.apply(attributes, map.attributes);
      }
      return { nodes: nodes, attributes: attributes };
    }

    // text node and sifrr-node
    if (html.nodeType === 3) {
      const x = html.nodeValue;
      if (x.indexOf('${') > -1) {
        let sn = window.document.createElement('sifrr-node');
        sn.appendChild(html.cloneNode());
        html.replaceWith(sn);
        nodes.push({
          tag: 'sifrr-node',
          data: x,
          dom: sn
        });
      }
      return { nodes: nodes, attributes: attributes };
    }

    // attributes
    const attrs = html.attributes || [], l = attrs.length;
    for(let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.value.indexOf('${') > -1) {
        attributes.push({
          name: attribute.name,
          value: attribute.value,
          dom: html
        });
      }
    }

    // children
    if (html.contentEditable == 'true' || html.nodeName == 'TEXTAREA') {
      nodes.push({
        tag: html.nodeName,
        data: html.innerHTML,
        dom: html
      });
    } else {
      const children = Parser.createStateMap(Array.prototype.slice.call(html.childNodes));
      Array.prototype.push.apply(nodes, children.nodes);
      Array.prototype.push.apply(attributes, children.attributes);
    }

    // return parent
    return { nodes: nodes, attributes: attributes };
  },
  twoWayBind: function(e) {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value || ( e.type == 'blur' ? target.innerHTML.trim()
      .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
      .replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>') : target.innerHTML );
    // target.setAttribute('value', value);
    let host = target.getRootNode();
    host = host.host;
    let data = {};
    data[target.dataset.sifrrBind] = value;
    host.state = data;
  },
  updateState: function(element) {
    if (!element.stateMap) {
      return false;
    }
    // Update nodes
    const nodes = element.stateMap.nodes, nodesL = nodes.length;
    for (let i = 0; i < nodesL; i++) {
      Parser.updateNode(nodes[i], element);
    }

    // Update attributes
    const attributes = element.stateMap.attributes, attributesL = attributes.length;
    for (let i = 0; i < attributesL; i++) {
      Parser.updateAttribute(attributes[i], element);
    }
  },
  updateNode: function(node, element) {
    // make use of VDOM for better diffing!
    const realHTML = node.dom.innerHTML;
    const newHTML = Parser.evaluateString(node.data, element);
    if (realHTML != newHTML) node.dom.innerHTML = newHTML;
  },
  updateAttribute: function(attr, element) {
    attr.dom.setAttribute(attr.name, Parser.evaluateString(attr.value, element));
  },
  evaluateString: function(string, element) {
    if (string.indexOf('${') < 0) return string;
    string = string.trim();
    if (string.indexOf('${') === 0) return replacer(string);
    return string.replace(/\${([^{}$]|{([^{}$])*})*}/g, replacer);

    function replacer(match) {
      let g1 = match.slice(2, -1);

      function executeCode() {
        let f;
        if (g1.search('return') >= 0) {
          f = new Function(g1).bind(element);
        } else {
          f = new Function('return ' + g1).bind(element);
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
};

module.exports = Parser;
