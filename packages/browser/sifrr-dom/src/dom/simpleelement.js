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
      if (this._state !== v) Object.assign(this._state, v);
      update(this, stateMap);
    }
  };

  content.sifrrClone = function(newState) {
    const clone = content.cloneNode(true);
    clone._refs = collect(clone, stateMap);
    clone._state = Object.assign({}, defaultState, newState);
    Object.defineProperty(clone, 'state', stateProps);
    update(clone, stateMap);
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
