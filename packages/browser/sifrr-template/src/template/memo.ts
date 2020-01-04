import { BindingFxn, SifrrProps } from './types';

type PropKeyFunction<T> = (props: SifrrProps<T>) => string;

export default function memo<T, O, N>(
  fxn: BindingFxn<T, O, N>,
  deps: string[] | PropKeyFunction<T> = []
): BindingFxn<T, O, N> {
  const isFunc = typeof deps === 'function';
  const depsL = !isFunc && deps.length;
  const memoValues: {
    [k: string]: N | Promise<N>;
  } = {};

  return (props: SifrrProps<T>, oldValue: O): N | Promise<N> => {
    let memoKey: string;
    if (isFunc) {
      memoKey = (<PropKeyFunction<T>>deps)(props);
    } else {
      memoKey = '';
      for (let i = 0; i < depsL; i++) {
        memoKey += props[deps[i]];
      }
    }

    if (memoValues[memoKey] === undefined) {
      memoValues[memoKey] = fxn(props, oldValue);
    }
    return memoValues[memoKey];
  };
}
