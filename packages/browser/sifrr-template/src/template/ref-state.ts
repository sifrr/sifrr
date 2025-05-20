export interface Ref<T> {
  value: T;
  __sifrrWatchers?: ((newValue: T) => void)[];
}

export const ref = <T>(value: T) => {
  const refObj: Ref<T> = new Proxy(
    { value, __sifrrWatchers: [] },
    {
      set: (target, prop, newValue) => {
        if (prop === '__sifrrWatchers') {
          return true;
        }
        if (prop === 'value') {
          target.value = newValue;
          if (refObj.__sifrrWatchers) {
            refObj.__sifrrWatchers.forEach((cb) => cb(newValue));
          }
          return true;
        }
        return false;
      }
    }
  );

  return refObj;
};
