export const isRef = Symbol('isRef');

export interface ComputedRef<T> {
  get value(): T;
  [isRef]: true;
}

export interface Ref<T> extends ComputedRef<T> {
  set value(v: T);
  __sifrrWatchers?: Set<(this: Ref<T>, newValue: T) => void>;
}

function deepProxy<X>(obj: X, handler: () => void): X {
  if (typeof obj !== 'object' || obj === null || (obj as any)[isRef]) {
    return obj;
  }

  const p = new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop === isRef) return true;
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
    __sifrrWatchers.forEach((cb) => {
      try {
        cb.call(refObj, value);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const refObj: Ref<T> = new Proxy(
    { value: deep ? deepProxy(value, handler) : value, __sifrrWatchers, [isRef]: true },
    {
      set: (target, prop, value, receiver) => {
        if (prop === 'value') {
          const oldValue = Reflect.get(target, prop, receiver);
          const ret = Reflect.set(target, prop, value, receiver);
          if (oldValue !== value) handler();
          return ret;
        }
        return false;
      }
    }
  );

  return refObj;
};

export const computed = <T>(fxn: (this: ComputedRef<T>) => T): ComputedRef<T> => {
  return {
    [isRef]: true,
    get value() {
      return fxn.call(this);
    }
  };
};

export const watch = <T>(
  refOrFxn: Ref<T> | (() => T),
  callback: (newValue: T, oldValue: T) => void
) => {
  const isFunc = typeof refOrFxn === 'function';
  let oldValue = isFunc ? refOrFxn() : refOrFxn.value;
  return () => {
    const newVal = isFunc ? refOrFxn() : refOrFxn.value;
    if (newVal !== oldValue) {
      callback(newVal, oldValue);
      oldValue = newVal;
    }
  };
};
