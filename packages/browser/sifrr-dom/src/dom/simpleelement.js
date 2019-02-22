const template = require('./template');
const update = require('./update');
const Parser = require('./parser');

function SimpleElement(content, defaultState = null) {
  if (!content.nodeType && typeof content !== 'string') {
    if (!content[0] || !content[0].nodeType) {
      throw TypeError('First argument for SimpleElement should be of type string or DOM element');
    }
  }
  const templ = template(content);
  content = templ.content.firstElementChild || templ.content.firstChild;
  // Already sifrr element
  if (content.isSifrr || content.nodeName.indexOf('-') !== -1 ||
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') !== -1)
  ) {
    return content;
  }
  const stateMap = Parser.createStateMap(content, false);
  function setProps(me) {
    me._refs = Parser.collectRefsSimple(me, stateMap);
    Object.defineProperty(me, 'state', {
      get: () => me._state,
      set: (v) => {
        me._state = Object.assign(me._state || {}, v);
        update(me, stateMap);
      }
    });
  }
  setProps(content);
  if (defaultState) content.state = defaultState;

  content.sifrrClone = function(deep = true, newState) {
    const clone = content.cloneNode(deep);
    setProps(clone);
    if (newState) clone.state = newState;
    else if (content.state) clone.state = content.state;
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
