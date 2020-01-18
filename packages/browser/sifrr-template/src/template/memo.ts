import { BindingFxn, SifrrProps } from './types';

type PropKeyFunction<T> = (props: SifrrProps<T>) => string;

export default function memo<T, O, N>(
  fxn: BindingFxn<T, O, N>,
  deps: string[] | PropKeyFunction<T> = []
): BindingFxn<T, O, N> {
  const isFunc = typeof deps === 'function';
  const depsL = !isFunc && deps.length;
  const memoValues = new Map();

  return (props: SifrrProps<T>, oldValue: O): N | Promise<N> => {
    let memoMap: Map<any, N | Promise<N>>;
    if (memoValues.has(props)) {
      memoMap = memoValues.get(props);
    } else {
      memoMap = new Map();
      memoValues.set(props, memoMap);
    }
    let memoKey: string;
    if (isFunc) {
      memoKey = (<PropKeyFunction<T>>deps)(props);
    } else {
      for (let i = 0; i < depsL; i++) {
        memoKey = memoKey ? `${memoKey}_${props[deps[i]]}` : props[deps[i]];
      }
    }

    if (!memoMap.has(memoKey)) {
      memoMap.set(memoKey, fxn(props, oldValue));
    }
    return memoMap.get(memoKey);
  };
}
