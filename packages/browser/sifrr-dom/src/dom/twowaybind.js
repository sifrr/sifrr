import { BIND_PROP } from './constants';
import shouldMerge from '../utils/shouldmerge';

export default e => {
  const target = e.composedPath ? e.composedPath()[0] : e.target;

  if (!target[BIND_PROP]) return;
  if (e.type === 'update' && !target._sifrrEventSet) return;

  const value = target.value || target.state || target.textContent;
  if (target.firstChild) target.firstChild.__data = value;

  let root = target._root || target.root || target.parentNode;
  while (root && !root.isSifrr) root = root.parentNode || root.host;
  if (root) {
    target._root = root;
    const prop = target[BIND_PROP];
    if (shouldMerge(root.state[prop], value)) {
      if (e.type === 'update') root.setState && root.setState({ [prop]: Object.assign({}, value) });
      else root.setState && root.setState({ [prop]: value });
    }
  } else target._root = null;
};
