const { collect, create } = require('./ref');
const template = require('./template');
const creator = require('./creator');
const update = require('./update');

const setupEl = (el, baseState, baseEl) => {
  const state = el.state || baseEl ? baseEl.state : baseState;
  el.stateMap = baseEl ? baseEl.stateMap : create(el, creator);
  el._refs = collect(el, el.stateMap);
  Object.defineProperty(el, 'state', {
    get: () => el._state,
    set: (v) => {
      el._oldState = Object.assign({}, el._state);
      el._state = Object.assign(el._state || {}, v);
      update(el, el.stateMap, true);
    }
  });
  if (state) el.state = state;
};

function SimpleElement(content, defaultState) {
  if (typeof content === 'string') {
    const templ = template(content);
    content = templ.content.firstElementChild || templ.content.firstChild;
  } else if (!content.nodeType) {
    throw TypeError('First argument for SimpleElement should be of type string or DOM element');
  }
  if (content.nodeName.indexOf('-') !== -1 ||
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') >= 0) ||
    // for document.createElement('tag', { is: 'custom-element' })
    content.isSifrr) return content;
  setupEl(content, defaultState);

  content.sifrrClone = function(deep = true) {
    const clone = content.cloneNode(deep);
    setupEl(clone, defaultState, content);
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
