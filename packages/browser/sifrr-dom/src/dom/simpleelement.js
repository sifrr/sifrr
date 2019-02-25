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
  const stateMap = Parser.createStateMap(content, defaultState);

  const stateProps = {
    get: function() { return this._state; },
    set: function(v) {
      this._state = Object.assign(this._state, v);
      update(this, stateMap);
    }
  };
  function setProps(me, state) {
    me._refs = Parser.collectRefsSimple(me, stateMap);
    me._state = Object.assign({}, defaultState, state);
    Object.defineProperty(me, 'state', stateProps);
    update(me, stateMap);
  }

  setProps(content);
  content.sifrrClone = function(deep = true, newState) {
    const clone = content.cloneNode(deep);
    setProps(clone, newState);
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
