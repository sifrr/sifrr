import { elName, props } from '@/dom/symbols';
import { ISifrrElement, SifrrElementKlass } from '@/dom/types';

export const Component = (options?: { tag: string }) => (target: SifrrElementKlass<any>) => {
  target[elName] = options?.tag;
};

export const Prop = () => (target: ISifrrElement, propertyName: string) => {
  const constructor = target.constructor as SifrrElementKlass<any>;
  constructor[props] = constructor[props] ?? new Set();
  constructor[props].add(propertyName);
};
