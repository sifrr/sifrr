export interface Ref<T> {
  value: T;
  __sifrrWatchers?: Set<(this: Ref<T>, newValue: T) => void>;
}

function deepProxy<T, X>(obj: X, handler: () => void) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const p = new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      return deepProxy(value, handler);
    },
    set(target, prop, value, receiver) {
      const ret = Reflect.set(target, prop, value, receiver);
      handler();
      return ret;
    },
    deleteProperty(target, prop) {
      const ret = Reflect.deleteProperty(target, prop);
      handler();
      return ret;
    }
  });

  return p;
}

export const ref = <T>(value: T, deep = true) => {
  const __sifrrWatchers: Ref<T>['__sifrrWatchers'] = new Set();
  const handler = () => {
    if (__sifrrWatchers.size <= 0) return;
    __sifrrWatchers.forEach((cb) => cb.call(refObj, value));
  };

  const refObj: Ref<T> = new Proxy(
    { value: deep ? deepProxy(value, handler) : value, __sifrrWatchers },
    {
      set: (target, prop, newValue) => {
        if (prop === 'value') {
          target.value = deep ? deepProxy(newValue, handler) : newValue;
          handler();
          return true;
        }
        return false;
      }
    }
  );

  return refObj;
};

export const computed = <T>(fxn: (this: Ref<T>) => T) => {
  const refObj: Ref<T> = new Proxy(
    { value: undefined as T },
    {
      set: (_, prop) => {
        return false;
      },
      get: (_, prop) => {
        if (prop === 'value') {
          return fxn.call(refObj);
        }
        return undefined;
      }
    }
  );

  return refObj;
};
