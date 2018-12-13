const Vdom = require('./vdom');
const Parser = {
  sifrrNode: window.document.createElement('sifrr-node'),
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
        if (html.parentNode.contentEditable == 'true' || html.parentNode.nodeName == 'TEXTAREA' || html.parentNode.nodeName == 'STYLE' || (html.parentNode.dataset && html.parentNode.dataset.sifrrHtml == 'true')) {
          nodes.push({
            tag: html.parentNode.nodeName,
            data: html.parentNode.innerHTML,
            dom: html.parentNode
          });
          html.parentNode.originalVdom = Vdom.toVdom(html.parentNode);
        } else {
          let sn = Parser.sifrrNode.cloneNode();
          const clone = html.cloneNode();
          sn.appendChild(clone);
          sn.originalVdom = {
            children: [{
              tag: '#text',
              data: x,
              dom: clone
            }]
          };
          html.replaceWith(sn);
          nodes.push({
            tag: 'sifrr-node',
            data: x,
            dom: sn
          });
        }
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
    const children = Parser.createStateMap(Array.prototype.slice.call(html.childNodes));
    Array.prototype.push.apply(nodes, children.nodes);
    Array.prototype.push.apply(attributes, children.attributes);

    // return parent
    return { nodes: nodes, attributes: attributes };
  },
  twoWayBind: function(e) {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value === undefined ? ( e.type == 'blur' ? target.innerHTML.trim()
      .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
      .replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>') : target.innerHTML ) : target.value;
    let data = {};
    data[target.dataset.sifrrBind] = value;
    target.getRootNode().host.state = data;
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
    let newHTML = Parser.evaluateString(node.data, element);
    if (realHTML == newHTML) return;
    if (!newHTML) newHTML = '';
    if (Array.isArray(newHTML) && newHTML[0] && newHTML[0].nodeType) {
      node.dom.innerHTML = '';
      node.dom.append(...newHTML);
    } else if (newHTML.nodeType) {
      node.dom.innerHTML = '';
      node.dom.appendChild(newHTML);
    } else {
      if (node.dom.contentEditable == 'true' || node.dom.nodeName == 'TEXTAREA' || node.dom.nodeName == 'STYLE' || (node.dom.dataset && node.dom.dataset.sifrrHtml == 'true')) {
        if (realHTML != newHTML) node.dom.innerHTML = newHTML;
      } else {
        if (realHTML != newHTML) node.dom.childNodes[0].textContent = newHTML;
      }
    }
  },
  updateAttribute: function(attr, element) {
    attr.dom.setAttribute(attr.name, Parser.evaluateString(attr.value, element));
  },
  evaluateString: function(string, element) {
    if (string.indexOf('${') < 0) return string;
    string = string.trim();
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
