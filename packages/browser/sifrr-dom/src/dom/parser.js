const { collect, create } = require('./ref');
const { TEXT_NODE, COMMENT_NODE, ELEMENT_NODE } = require('./constants');

function isHtml(el) {
  return (el.dataset && el.dataset.sifrrHtml == 'true') ||
    el.nodeName == 'TEXTAREA' ||
    el.nodeName == 'STYLE' ||
    (el.dataset && el.dataset.sifrrRepeat);
}

function creator(el) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    // text node
    const x = el.data;
    if (x.indexOf('${') > -1) return {
      html: false,
      text: x
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (isHtml(el)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') >= 0) {
        sm.html = true;
        sm.text = innerHTML.replace(/<!--(.*)-->/g, '$1');
      }
    }
    // attributes
    const attrs = el.attributes, l = attrs.length;
    const attrStateMap = { events: {} };
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.name[0] === '$') {
        attrStateMap.events[attribute.name] = attribute.value;
      } else if (attribute.value.indexOf('${') >= 0) {
        if (attribute.name === 'style') {
          const styles = {};
          attribute.value.split(';').forEach((s) => {
            const [n, v] = s.split(/:(?!\/\/)/);
            if (n && v && v.indexOf('${') >= 0) {
              styles[n.trim()] = v.trim();
            }
          });
          attrStateMap[attribute.name] = styles;
        } else {
          attrStateMap[attribute.name] = attribute.value;
        }
      }
    }
    if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
    if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;

    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}

const Parser = {
  collectRefs: (el, stateMap) => collect(el, stateMap, isHtml),
  createStateMap: (element) => create(element, creator, isHtml),
  twoWayBind: (e) => {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value || target.textContent;
    let state = {};
    let root;
    if (target._root) {
      root = target._root;
    } else {
      root = target;
      while(!root.isSifrr) root = root.parentNode || root.host;
      target._root = root;
    }
    state[target.dataset.sifrrBind] = value;
    root.state = state;
  },
  evaluateString: (string, element) => {
    if (string.indexOf('${') < 0) return string;
    string = string.trim();
    if (string.match(/^\${([^{}$]|{([^{}$])*})*}$/)) return replacer(string);
    return replacer('`' + string + '`');

    function replacer(match) {
      if (match[0] == '$') match = match.slice(2, -1);
      let f;
      if (match.indexOf('return ') >= 0) {
        f = new Function(match).bind(element);
      } else {
        f = new Function('return ' + match).bind(element);
      }
      return f();
    }
  }
};

module.exports = Parser;
