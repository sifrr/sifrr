import { SifrrProps, SifrrCreateFunction, SifrrNodesArray } from '../template/types';
import { makeChildrenEqual } from '../template/makeequal';

export default function <T>(
  template: SifrrCreateFunction<T>,
  data: SifrrProps<T>[] = [],
  oldValue: SifrrNodesArray<T>
): SifrrNodesArray<T> {
  const ret = makeChildrenEqual(oldValue, data, template);
  ret.isRendered = true;

  return ret;
}
