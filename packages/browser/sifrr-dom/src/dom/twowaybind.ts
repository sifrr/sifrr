import { BIND_PROP } from './constants';
import { ISifrrElement } from './types';

export default (e: Event) => {
  const target = <HTMLElement>(e.composedPath ? e.composedPath()[0] : e.target);

  if (!target[BIND_PROP]) return;
  if (e.type === 'update' && !(<ISifrrElement>target)._sifrrEventSet) return;

  const value =
    (<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>target).value ||
    (<ISifrrElement>target).state ||
    target.textContent;
  if (target.firstChild) (<Text>target.firstChild).__data = value;

  let root = target._root || (<ISifrrElement>target).root || target.parentNode;
  while (root && !root.isSifrr) root = root.parentNode || root.host;
  if (root) {
    (<ISifrrElement>target)._root = <ISifrrElement>root;
    const prop = target[BIND_PROP];
    if (typeof prop === 'function') {
      prop.call(root, value);
      (<ISifrrElement>root).update && (<ISifrrElement>root).update();
    } else if (e.type === 'update')
      (<ISifrrElement>root).setState &&
        (<ISifrrElement>root).setState({ [prop]: Object.assign({}, value) });
    else (<ISifrrElement>root).setState && (<ISifrrElement>root).setState({ [prop]: value });
  } else target._root = null;
};
