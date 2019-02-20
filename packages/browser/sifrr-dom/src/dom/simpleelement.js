const { collect, create } = require('./ref');
const template = require('./template');
const { simpleUpdate } = require('./update');
const { simpleCreator } = require('./simplecreator');

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
  const stateMap = create(content, simpleCreator);
  function setProps(me) {
    me.stateMap = stateMap;
    me._refs = collect(me, stateMap);
    Object.defineProperty(me, 'state', {
      get: () => me._state,
      set: (v) => {
        me._state = Object.assign(me._state || {}, v);
        simpleUpdate(me);
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
