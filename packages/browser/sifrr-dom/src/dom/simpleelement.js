import template from './template';
import update from './update';
import { collect, create } from './ref';
import creator from './creator';

function sifrrClone(newState) {
  // this = content
  const clone = this.cloneNode(true);
  clone.root = this._root;
  clone._refs = collect(clone, this.stateMap);
  clone.state = Object.assign({}, this.sifrrDefaultState, newState);
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
      // Render sifrr element if not rendered
      window.document.body.appendChild(content);
      window.document.body.removeChild(content);
    }
    if (content.isSifrr) return content;
  }
  content.sifrrDefaultState = defaultState;
  content.stateMap = create(content, creator, defaultState);
  content.sifrrClone = sifrrClone;
  content.stateProps = {
    setState: function(v) {
      if (!this.state) return;
      if (this.state !== v) Object.assign(this.state, v);
      update(this, content.stateMap);
    },
    getState: function() {
      return this.state;
    }
  };
  return content;
}
