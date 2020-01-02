import {
  SifrrProps,
  SifrrCreateFunction,
  SifrrNodesArray,
  DomBindingReturnValue
} from '../template/types';
import { makeChildrenEqual } from '../template/makeequal';

export default function<T>(
  template: SifrrCreateFunction<T>,
  data: SifrrProps<T>[] = [],
  oldValue: SifrrNodesArray<T>[]
): DomBindingReturnValue {
  const ret = <DomBindingReturnValue>makeChildrenEqual(oldValue, data, template);
  ret.isRendered = true;

  return ret;
}
