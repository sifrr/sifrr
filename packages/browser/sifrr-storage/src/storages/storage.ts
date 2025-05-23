import { stringify } from '../utils/json';
import { parseGetData, parseSetValue } from '../utils/dataparser';
import { StorageOptions, SifrrStore } from './types';
import LocalStorageStore from '@/storages/localstorage';
import IndexedDBStore from '@/storages/indexeddb';
import MemoryStore from '@/storages/memory';

const defaultOptions = {
  prefix: '',
  stores: [LocalStorageStore, IndexedDBStore, MemoryStore]
} as const;

export default class Storage {
  private readonly store: SifrrStore;

  constructor(options?: StorageOptions) {
    const stores = options?.stores ?? defaultOptions.stores;
    const prefix = options?.prefix ?? defaultOptions.prefix;
    const StoreToUse = (Array.isArray(stores) ? stores : [stores]).find(
      (store) => store?.isSupported
    );
    if (!StoreToUse) {
      throw new Error('No supported store found');
    }
    this.store = new StoreToUse(prefix);
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    const v = await this.store.get(key);
    return parseGetData(v, this.delete.bind(this, key));
  }
  async set(key: string, value: any, ttl?: number) {
    return this.store.set(key, parseSetValue(value, ttl));
  }
  async has(key: string) {
    return this.store.has(key);
  }
  async all<T = any>(): Promise<{ [key: string]: T }> {
    const data = await this.store.all();
    for (const key in data) {
      const v = parseGetData(data[key], this.delete.bind(this, key));
      if (v !== undefined) {
        data[key] = v;
      } else {
        delete data[key];
      }
    }
    return data as { [key: string]: any };
  }
  async delete(key: string) {
    return this.store.delete(key);
  }
  async clear() {
    return this.store.clear();
  }
  memoize<T extends any[], X>(
    func: (...arg: T) => Promise<X> | X,
    keyFunc = (...arg: Parameters<typeof func>) =>
      typeof arg[0] === 'string' ? arg[0] : stringify(arg[0])
  ) {
    return async (...args: Parameters<typeof func>) => {
      const key = keyFunc(...args);
      const data = await this.get(key);
      if (data === undefined || data === null) {
        const result = await func(...args);
        await this.set(key, result);
        return result;
      } else {
        return data;
      }
    };
  }
}
