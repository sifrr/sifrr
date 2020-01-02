import { SifrrProps, SifrrCreateFunction, SifrrNode } from '../template/types';
import update from '../template/update';

export default function bindTemplate<T>(
  template: SifrrCreateFunction<T>,
  props: SifrrProps<T>,
  oldValue: SifrrNode<T>[]
): SifrrNode<T>[] {
  if (oldValue) {
    update(oldValue, props);
    return oldValue;
  }

  return template(props);
}
