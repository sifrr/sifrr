import template from './template';
import update from './update';
import { collect, create } from './ref';
import creator from './creator';

function sifrrClone(newState) {
  // this = content
  const clone = this.cloneNode(true);
  clone.root = this._root;
  clone._refs = collect(clone, this.stateMap);
  clone._state = Object.assign({}, this.defaultState, newState);
  clone.getState = this.stateProps.getState;
  clone.setState = this.stateProps.setState;
  update(clone, this.stateMap);
  return clone;
}

export default function SimpleElement(content, defaultState = null) {
  const templ = template(content);
  content = templ.content.firstElementChild || templ.content.firstChild;
  // Already sifrr element
  if (
    content.isSifrr ||
    content.nodeName.indexOf('-') !== -1 ||
    (content.getAttribute &&
      content.getAttribute('is') &&
      content.getAttribute('is').indexOf('-') > 0)
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
    setState: function(v) {
      if (this._state !== v) Object.assign(this._state, v);
      update(this, content.stateMap);
    },
    getState: function() {
      return this._state;
    }
  };
  return content;
}
