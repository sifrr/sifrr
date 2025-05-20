import { SifrrCreateFunction, SifrrKeyedProps, SifrrNodesArrayKeyed } from '../template/types';
import { makeChildrenEqualKeyed } from '../template/keyed';

export default function <T>(
  template: SifrrCreateFunction<T>,
  data: SifrrKeyedProps<T>[] = [],
  oldValue: SifrrNodesArrayKeyed<T>
): SifrrNodesArrayKeyed<T> {
  const ret = makeChildrenEqualKeyed(oldValue, data, template);
  ret.isRendered = true;

  return ret;
}
