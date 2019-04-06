const template = require('./template');
const update = require('./update');
const { collect, create } = require('./ref');
const creator = require('./creator');

function sifrrClone(newState) {
  const clone = this.cloneNode(true);
  clone._refs = collect(clone, this.stateMap);
  clone._state = Object.assign({}, this.defaultState, newState);
  Object.defineProperty(clone, 'state', this.stateProps);
  update(clone, this.stateMap);
  return clone;
}

function SimpleElement(content, defaultState = null) {
  const templ = template(content);
  if (!templ.content || templ.content.childNodes.length < 1) {
    throw TypeError('First argument for SimpleElement should be of type string or DOM element');
  }
  content = templ.content.firstElementChild || templ.content.firstChild;
  // Already sifrr element
  if (content.isSifrr || content.nodeName.indexOf('-') !== -1 ||
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') > 0)
  ) {
    if (!content.isSifrr) {
      // Render custom element if not rendered
      window.document.body.appendChild(content);
      window.document.body.removeChild(content);
    }
    return content;
  }
  content.defaultState = defaultState;
  content.stateMap = create(content, creator, defaultState);
  content.sifrrClone = sifrrClone;
  content.stateProps = {
    get: function() { return this._state; },
    set: function(v) {
      if (this._state !== v) Object.assign(this._state, v);
      update(this, content.stateMap);
    }
  };
  return content;
}

module.exports = SimpleElement;
