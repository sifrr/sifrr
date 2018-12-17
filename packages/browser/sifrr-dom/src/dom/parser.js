const { makeChildrenEqual } = require('./makeequal');
const Parser = {
  sifrrNode: window.document.createElement('sifrr-node'),
  createStateMap: function(element, shadowRoot = element.shadowRoot) {
    // Empty map
    let nodes = [], attributes = [], el;
    const treeWalker = document.createTreeWalker(
      shadowRoot,
      NodeFilter.SHOW_ALL
    );

    while(treeWalker.nextNode()) {
      el = treeWalker.currentNode;
      if (el.nodeType === window.Node.TEXT_NODE) {
        // text node
        const textStateMap = Parser.createTextStateMap(el);
        if (textStateMap) nodes.push(textStateMap);
      } else if (el.nodeType === window.Node.COMMENT_NODE) {
        // comment
        const textStateMap = Parser.createTextStateMap(el);
        if (textStateMap) nodes.push(textStateMap);
      } else if (el.nodeType === window.Node.ELEMENT_NODE) {
        // attributes
        const attrStateMap = Parser.createAttributeStateMap(el);
        if (attrStateMap) attributes.push(attrStateMap);
      }
    }

    element.stateMap = { nodes: nodes, attributes: attributes };
  },
  createTextStateMap: function(textElement) {
    const x = textElement.nodeValue;
    if (x.indexOf('${') > -1) {
      // Not contenteditable and data-sifrr-html='true'
      if (textElement.parentNode.contentEditable != 'true' && textElement.parentNode.dataset && textElement.parentNode.dataset.sifrrHtml == 'true') {
        return {
          tag: textElement.parentNode.nodeName,
          data: textElement.parentNode.innerHTML,
          dom: textElement.parentNode
        };
      // contenteditable, textarea and styles
      } else if (textElement.parentNode.contentEditable == 'true' || textElement.parentNode.nodeName == 'TEXTAREA' || textElement.parentNode.nodeName == 'STYLE') {
        return {
          tag: textElement.parentNode.nodeName,
          data: textElement.parentNode.innerHTML,
          dom: textElement.parentNode
        };
      } else {
        return {
          tag: '#text',
          data: x,
          dom: textElement
        };
      }
    }
  },
  createAttributeStateMap: function(element) {
    const attrs = element.attributes || [], l = attrs.length;
    let attributes = {};
    for(let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.value.indexOf('${') > -1) {
        attributes[attribute.name] = attribute.value;
      }
    }
    if (Object.keys(attributes).length > 0) return { element: element, attributes: attributes };
  },
  twoWayBind: function(e) {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value === undefined ? target.innerHTML : target.value;
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
    const newHTML = Parser.evaluateString(node.data, element);
    if (realHTML == newHTML) return;
    if (newHTML === undefined) return node.dom.textContent = '';
    // Improve this with diffing!
    if (Array.isArray(newHTML) && newHTML[0] && newHTML[0].nodeType) {
      makeChildrenEqual(node.dom, newHTML);
    } else if (newHTML.nodeType) {
      makeChildrenEqual(node.dom, [newHTML]);
    } else {
      if (node.dom.dataset && node.dom.dataset.sifrrHtml == 'true') {
        const docFrag = Parser.sifrrNode.cloneNode();
        docFrag.innerHTML = newHTML.toString()
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
          .replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
        makeChildrenEqual(node.dom, docFrag.childNodes);
      } else {
        if (node.dom.nodeName == 'TEXTAREA') {
          // Provide two way binding for textarea
          if (node.dom.value !== newHTML) node.dom.value = newHTML;
        } else if (node.dom.contentEditable == 'true') {
          if (node.dom.innerHTML !== newHTML) node.dom.innerHTML = newHTML;
        } else if (node.dom.textContent !== newHTML) {
          node.dom.textContent = newHTML.toString();
        }
      }
    }
  },
  updateAttribute: function(attribute, base) {
    const element = attribute.element;
    for(let key in attribute.attributes) {
      const val = Parser.evaluateString(attribute.attributes[key], base);
      element.setAttribute(key, val);

      // select's value doesn't change on changing value attribute
      if (element.nodeName == 'SELECT' && key == 'value') element.value = val;
    }
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
