const { collect, create } = require('./ref');
const template = require('./template');
const { simpleUpdate } = require('./update');
const { simpleCreator } = require('./creator');

function SimpleElement(content, defaultState = null) {
  let templ;
  if (typeof content === 'string') {
    templ = template(content);
    content = templ.content.firstElementChild || templ.content.firstChild;
  } else if (!content.nodeType) {
    throw TypeError('First argument for SimpleElement should be of type string or DOM element');
  }
  // Already sifrr element
  if (content.isSifrr) return content;
  if (content.nodeName.indexOf('-') !== -1 ||
    // for '<tag is=custom-element></tag>'
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') >= 0)
  ) {
    // render node to make it sifrr element
    window.document.body.appendChild(content);
    content.remove();
    return content;
  }
  content.stateMap = create(content, simpleCreator);
  content._refs = collect(content, content.stateMap);
  Object.defineProperty(content, 'state', {
    get: () => content._state,
    set: (v) => {
      content._oldState = Object.assign({}, content._state);
      content._state = Object.assign(content._state || {}, v);
      simpleUpdate(content);
    }
  });
  if (defaultState) content.state = defaultState;

  content.sifrrClone = function(deep = true) {
    const clone = content.cloneNode(deep);
    clone.stateMap = content.stateMap;
    clone._refs = collect(clone, content.stateMap);
    Object.defineProperty(clone, 'state', {
      get: () => clone._state,
      set: (v) => {
        clone._oldState = Object.assign({}, clone._state);
        clone._state = Object.assign(clone._state || {}, v);
        simpleUpdate(clone);
      }
    });
    if (content.state) clone.state = content.state;
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
