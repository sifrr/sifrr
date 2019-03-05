const template = require('./template');
const update = require('./update');
const { collect, create } = require('./ref');
const creator = require('./creator');

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
    if (!content.isSifrr) {
      // Render custom element if not rendered
      window.document.body.appendChild(content);
      window.document.body.removeChild(content);
    }
    return content;
  }
  const stateMap = create(content, creator, defaultState);

  const stateProps = {
    get: function() { return this._state; },
    set: function(v) {
      Object.assign(this._state, v);
      update(this, stateMap);
    }
  };
  function setProps(me, state) {
    me._refs = collect(me, stateMap, 'nextNode');
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
