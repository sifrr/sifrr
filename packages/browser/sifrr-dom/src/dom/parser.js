const Vdom = require('./vdom');
const Parser = {
  sifrrNode: window.document.createElement('sifrr-node'),
  createStateMap: function(element, shadowRoot = element.shadowRoot) {
    element.stateMap = Parser._createStateMap(shadowRoot);
  },
  _createStateMap: function(html) {
    // Empty map
    let nodes = [], attributes = [];

    // children
    if (Array.isArray(html)) {
      while(html.length) {
        const map = Parser._createStateMap(html.shift());
        Array.prototype.push.apply(nodes, map.nodes);
        Array.prototype.push.apply(attributes, map.attributes);
      }
      return { nodes: nodes, attributes: attributes };
    }

    // text node and sifrr-node
    if (html.nodeType === 3) {
      return Parser.createTextStateMap(html);
    }

    // attributes
    Array.prototype.push.apply(attributes, Parser.createAttributeStateMap(html));

    // add children state maps
    const children = Parser._createStateMap(Array.prototype.slice.call(html.childNodes));
    Array.prototype.push.apply(nodes, children.nodes);
    Array.prototype.push.apply(attributes, children.attributes);

    // return parent
    return { nodes: nodes, attributes: attributes };
  },
  createTextStateMap: function(textElement) {
    const x = textElement.nodeValue;
    let nodes = [];
    if (x.indexOf('${') > -1) {
      // Not contenteditable and data-sifrr-html='true'
      if (textElement.parentNode.contentEditable != 'true' && textElement.parentNode.dataset && textElement.parentNode.dataset.sifrrHtml == 'true') {
        nodes.push({
          tag: textElement.parentNode.nodeName,
          data: textElement.parentNode.innerHTML,
          dom: textElement.parentNode
        });
        textElement.parentNode.originalVdom = Vdom.toVdom(textElement.parentNode);
      // contenteditable, textarea and styles
      } else if (textElement.parentNode.contentEditable == 'true' || textElement.parentNode.nodeName == 'TEXTAREA' || textElement.parentNode.nodeName == 'STYLE') {
        nodes.push({
          tag: textElement.parentNode.nodeName,
          data: x,
          dom: textElement.parentNode
        });
      } else {
        nodes.push({
          tag: '#text',
          data: x,
          dom: textElement
        });
      }
    }
    return { nodes: nodes, attributes: [] };
  },
  createAttributeStateMap: function(element) {
    const attrs = element.attributes || [], l = attrs.length;
    let attributes = [];
    for(let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.value.indexOf('${') > -1) {
        attributes.push({
          name: attribute.name,
          value: attribute.value,
          dom: element
        });
      }
    }
    return attributes;
  },
  twoWayBind: function(e) {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value === undefined ? target.innerHTML : target.value;
    let data = {};
    data[target.dataset.sifrrBind] = value;
    target.getRootNode().host.state = data;
  },
  updateState: async function(element) {
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
    if (realHTML == newHTML) return;
    if (newHTML === undefined) return node.dom.textContent = '';
    if (Array.isArray(newHTML) && newHTML[0] && newHTML[0].nodeType) {
      node.dom.innerHTML = '';
      node.dom.append(...newHTML);
    } else if (newHTML.nodeType) {
      node.dom.innerHTML = '';
      node.dom.appendChild(newHTML);
    } else {
      if (node.dom.dataset && node.dom.dataset.sifrrHtml == 'true') {
        node.dom.innerHTML = newHTML.toString()
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
          .replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
      } else {
        if (node.dom.nodeName == 'TEXTAREA') {
          if (node.dom.value !== newHTML) node.dom.value = newHTML;
        } else if (node.dom.textContent !== newHTML) {
          node.dom.textContent = newHTML.toString();
        }
      }
    }
  },
  updateAttribute: function(attr, element) {
    const val = Parser.evaluateString(attr.value, element);
    attr.dom.setAttribute(attr.name, val);

    // select's value doesn't change on changing value attribute
    if (attr.dom.nodeName == 'SELECT' && attr.name == 'value') attr.dom.value = val;
  },
  evaluateString: function(string, element) {
    if (string.indexOf('${') < 0) return string;
    string = string.trim();
    if (string.match(/^\${([^{}$]|{([^{}$])*})*}$/)) return replacer(string);
    return replacer('`' + string + '`');

    function replacer(match) {
      if (match[0] == '$') match = match.slice(2, -1);
      let f;
      if (match.search('return') >= 0) {
        f = new Function(match).bind(element);
      } else {
        f = new Function('return ' + match).bind(element);
      }
      return f();
    }
  }
};

module.exports = Parser;
