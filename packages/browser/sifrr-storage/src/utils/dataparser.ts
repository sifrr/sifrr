import { SavedDataObject, SavedData } from '../storages/types';

// always bind to storage
export const parseGetData = (
  original: SavedDataObject,
  onExpire: (k: string) => Promise<boolean> | undefined
): object => {
  const now = Date.now();
  Object.keys(original).forEach((k) => {
    if (typeof original[k] === 'undefined') return;

    const { createdAt, ttl } = original[k];
    original[k] = original[k]?.value;

    if (ttl === 0) return;

    if (now - createdAt > ttl) {
      delete original[k];
      onExpire?.(k);
    }
  });
  return original;
};

export const parseSetValue = (value: any, defaultTtl: number = 0): SavedData => {
  if (value?.value) {
    value.ttl = value.ttl ?? defaultTtl;
    value.createdAt = Date.now();
    return value;
  } else {
    return {
      value,
      ttl: defaultTtl,
      createdAt: Date.now()
    };
  }
};

export const parseSetData = (
  key: string | Record<string, unknown>,
  value: unknown | undefined,
  defaultTtl: number | undefined
): SavedDataObject => {
  if (typeof key === 'string') {
    return { [key]: parseSetValue(value, defaultTtl) };
  } else {
    const data: SavedDataObject = {};
    Object.keys(key).forEach((k) => (data[k] = parseSetValue(key[k], defaultTtl)));
    return data;
  }
};

export const parseKey = (key: string | string[]): string[] => {
  if (Array.isArray(key)) {
    return key;
  } else {
    return [key];
  }
};
