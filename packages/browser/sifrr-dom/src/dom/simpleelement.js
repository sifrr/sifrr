const { collect, create } = require('./ref');
const template = require('./template');
const { simpleUpdate } = require('./update');
const { simpleCreator } = require('./simplecreator');

const setProps = (me, stateMap) => {
  me.stateMap = stateMap;
  me._refs = collect(me, stateMap);
  Object.defineProperty(me, 'state', {
    get: () => me._state,
    set: (v) => {
      me._state = Object.assign(me._state || {}, v);
      simpleUpdate(me);
    }
  });
  return ;
};

function SimpleElement(content, defaultState = null) {
  let templ;
  templ = template(content);
  content = templ.content.firstElementChild || templ.content.firstChild;
  if (!content.nodeType) {
    throw TypeError('First argument for SimpleElement should be of type string or DOM element');
  }
  // Already sifrr element
  if (content.isSifrr) return content;
  if (content.nodeName.indexOf('-') !== -1 ||
    // for '<tag is=custom-element></tag>'
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') !== -1)
  ) {
    // render node to make it sifrr element
    window.document.body.appendChild(content);
    content.remove();
    return content;
  }
  const baseStateMap = create(content, simpleCreator);
  setProps(content, baseStateMap);
  if (defaultState) content.state = defaultState;

  content.sifrrClone = function(deep = true, newState) {
    const clone = content.cloneNode(deep);
    setProps(clone, baseStateMap);
    if (newState) clone.state = newState;
    else if (content.state) clone.state = content.state;
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
