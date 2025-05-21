export interface ComputedRef<T> {
  value: T;
}

export interface Ref<T> extends ComputedRef<T> {
  __sifrrWatchers?: Set<(this: Ref<T>, newValue: T) => void>;
}

function deepProxy<X>(obj: X, handler: () => void): X {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const p = new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      return deepProxy(value, handler);
    },
    set(target, prop, value, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      const ret = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) handler();
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
      set: (target, prop, value, receiver) => {
        if (prop === 'value') {
          const oldValue = Reflect.get(target, prop, receiver);
          const newValue = deepProxy(value, handler);
          const ret = Reflect.set(target, prop, newValue, receiver);
          if (oldValue !== value) handler();
          return ret;
        }
        return false;
      }
    }
  );

  return refObj;
};

export const computed = <T>(fxn: (this: ComputedRef<T>) => T) => {
  const refObj: ComputedRef<T> = new Proxy(
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
