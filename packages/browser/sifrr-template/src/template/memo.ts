import { BindingFxn, SifrrProps } from './types';

type PropKeyFunction<T> = (props: SifrrProps<T>) => any;

const startRet = Symbol('startRet');

export default function memo<T, O, N = O>(
  fxn: BindingFxn<T, O, N>,
  deps: (keyof SifrrProps<T>)[] | PropKeyFunction<T> = []
): BindingFxn<T, O, N> {
  const isFunc = typeof deps === 'function';
  const depsL = !isFunc ? deps.length : 0;
  let retValue: N | Promise<N> | O | symbol | string = startRet;

  const getMemo = (props: SifrrProps<T>) => {
    if (isFunc) {
      return [deps(props)];
    }
    return deps.map((k) => (props && typeof props === 'object' ? props[k] : ''));
  };
  let prevMemo: any[] = [];

  return (props: SifrrProps<T>, oldValue: O): N | Promise<N> => {
    if (retValue === startRet) {
      retValue = fxn(props, oldValue);
      prevMemo = getMemo(props);
      return retValue;
    }

    const newMemo = getMemo(props);
    if (prevMemo.length !== newMemo.length) {
      prevMemo = newMemo;
      retValue = fxn(props, oldValue);
      return retValue;
    }
    for (let i = 0; i < depsL; i++) {
      if (prevMemo[i] !== newMemo[i]) {
        prevMemo = newMemo;
        retValue = fxn(props, oldValue);
        return retValue;
      }
    }

    return retValue as N | Promise<N>;
  };
}
