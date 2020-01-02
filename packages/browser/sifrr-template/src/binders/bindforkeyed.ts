import {
  SifrrCreateFunction,
  DomBindingReturnValue,
  ChildNodeKeyed,
  SifrrKeyedProps
} from '../template/types';
import { makeChildrenEqualKeyed } from '../template/keyed';

export default function<T>(
  template: SifrrCreateFunction<T>,
  data: SifrrKeyedProps<T>[] = [],
  oldValue: ChildNodeKeyed[]
): DomBindingReturnValue {
  const ret = <DomBindingReturnValue>makeChildrenEqualKeyed(oldValue, data, template);
  ret.isRendered = true;

  return ret;
}
