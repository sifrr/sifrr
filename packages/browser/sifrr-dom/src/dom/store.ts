import { MaybePromise, ref, Ref } from '@sifrr/template';

const stores = new Map<string, Ref<any>>();

export const store = <T>(name: string, value: T | (() => MaybePromise<T>), deep = true): Ref<T> => {
  if (stores.has(name)) {
    throw Error(`Store with name ${name} is already defined`);
  }
  const v = typeof value === 'function' ? ({} as T) : value;
  const st = ref(v, deep);

  if (typeof value === 'function') {
    Promise.resolve((value as () => MaybePromise<T>)()).then((v) => (st.value = v as T));
  }

  stores.set(name, st);
  console.log(`Store: ${name} created`);
  return st;
};

export const getStore = <T>(name: string) => stores.get(name) as T;
