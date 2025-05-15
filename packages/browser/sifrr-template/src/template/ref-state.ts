export interface Ref<T> {
  value: T;
  __sifrrState?: boolean;
  __sifrrOnChange?: ((newValue: T) => void)[];
}

export const ref = <T>(value: T) => {
  const refObj: Ref<T> = new Proxy(
    { value, __sifrrState: true, __sifrrOnChange: [] },
    {
      set: (target, prop, newValue) => {
        if (prop === '__sifrrState' || prop === '__sifrrOnChange') {
          target[prop] = newValue;
          return true;
        }
        if (prop === 'value') {
          target.value = newValue;
          if (refObj.__sifrrOnChange) {
            refObj.__sifrrOnChange.forEach((cb) => cb(newValue));
          }
          return true;
        }
        return false;
      }
    }
  );

  return refObj;
};
