import template from './template';
import update from './update';
import { collect, create } from './ref';
import creator from './creator';
import { ISifrrElement } from './types';

function sifrrClone(newState: any) {
  // this = content
  const clone = this.cloneNode(true);
  clone.root = this._root;
  clone._refs = collect(clone, this.stateMap);
  clone.state = Object.assign({}, this.defaultState, newState);
  clone.setState = this.stateProps.setState;
  update(clone, this.stateMap);
  return clone;
}

export default function SimpleElement(
  content:
    | string
    | TemplateStringsArray
    | HTMLTemplateElement
    | HTMLElement
    | NodeList
    | Node[]
    | NodeListOf<ChildNode>,
  defaultState = null
) {
  const templ = template(content);
  const se = <ISifrrElement>(templ.content.firstElementChild || templ.content.firstChild);
  // Already sifrr element
  if (
    se.isSifrr ||
    se.nodeName.indexOf('-') !== -1 ||
    (se.getAttribute && se.getAttribute('is') && se.getAttribute('is').indexOf('-') > 0)
  ) {
    if (!se.isSifrr) {
      // Render sifrr element if not rendered
      window.document.body.appendChild(se);
      window.document.body.removeChild(se);
    }
    if (se.isSifrr) return se;
  }
  se.defaultState = defaultState;
  se.stateMap = create(se, creator, defaultState);
  se.sifrrClone = sifrrClone;
  se.stateProps = {
    setState: function(v: any) {
      if (!this.state) return;
      if (this.state !== v) Object.assign(this.state, v);
      update(this, se.stateMap);
    }
  };
  return se;
}
