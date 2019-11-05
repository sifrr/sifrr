import { stringify, parse } from '../utils/json';
import { parseGetData, parseKey, parseSetData } from '../utils/dataparser';
import { StorageOptions } from './types';

const defaultOptions: StorageOptions = {
  name: 'SifrrStorage',
  version: 1,
  description: 'Sifrr Storage',
  size: 5 * 1024 * 1024,
  ttl: 0
};

class Storage {
  static type: string;
  static _all: Array<Storage>;

  type: string = (<typeof Storage>this.constructor).type;

  name: string;
  version: string | number;
  ttl: number;
  description: string;
  size: number;

  tableName: string;
  private table = {};

  constructor(options: StorageOptions = defaultOptions) {
    Object.assign(this, defaultOptions, options);
    this.tableName = this.name + this.version;
  }

  // overwrited methods
  protected select(keys: string[]): object | Promise<object> {
    const table = this.getStore();
    const ans = {};
    keys.forEach(key => (ans[key] = table[key]));
    return ans;
  }

  protected upsert(data: { [x: string]: any }): boolean | Promise<boolean> {
    const table = this.getStore();
    for (let key in data) {
      table[key] = data[key];
    }
    this.setStore(table);
    return true;
  }

  protected delete(keys: string[]): boolean | Promise<boolean> {
    const table = this.getStore();
    keys.forEach(key => delete table[key]);
    this.setStore(table);
    return true;
  }

  protected deleteAll(): boolean | Promise<boolean> {
    this.setStore({});
    return true;
  }

  protected getStore(): {} {
    return this.table;
  }

  protected setStore(v: {}) {
    this.table = v;
  }

  keys() {
    return Promise.resolve(this.getStore()).then(d => Object.keys(d));
  }

  all() {
    return Promise.resolve(this.getStore()).then(d => parseGetData(d, this.del.bind(this)));
  }

  get(key: string) {
    return Promise.resolve(this.select(parseKey(key))).then(d =>
      parseGetData(d, this.del.bind(this))
    );
  }

  set(key: string | object, value: any) {
    return Promise.resolve(this.upsert(parseSetData(key, value, this.ttl)));
  }

  del(key: string | string[]) {
    return Promise.resolve(this.delete(parseKey(key)));
  }

  clear() {
    return Promise.resolve(this.deleteAll());
  }

  memoize(
    func: (...arg: any[]) => Promise<any>,
    keyFunc = (...arg: any[]) => (typeof arg[0] === 'string' ? arg[0] : stringify(arg[0]))
  ) {
    return (...args: any) => {
      const key = keyFunc(...args);
      return this.get(key).then(data => {
        if (data[key] === undefined || data[key] === null) {
          const resultPromise = func(...args);
          if (!(resultPromise instanceof Promise))
            throw Error('Only promise returning functions can be memoized');
          return resultPromise.then(v => {
            return this.set(key, v).then(() => v);
          });
        } else {
          return data[key];
        }
      });
    };
  }

  isSupported(force = true) {
    if (force && (typeof window === 'undefined' || typeof document === 'undefined')) {
      return true;
    } else if (window && this.hasStore()) {
      return true;
    } else {
      return false;
    }
  }

  hasStore() {
    return true;
  }

  isEqual(other: { tableName: string; type: string }) {
    if (this.tableName == other.tableName && this.type == other.type) {
      return true;
    } else {
      return false;
    }
  }

  // aliases
  static stringify(data: any) {
    return stringify(data);
  }

  static parse(data: string) {
    return parse(data);
  }

  // one instance per store
  static _add(instance: Storage) {
    this._all = this._all || [];
    this._all.push(instance);
  }

  static _matchingInstance<T extends Storage>(otherInstance: Storage): T {
    const all = this._all || [],
      length = all.length;
    for (let i = 0; i < length; i++) {
      if (all[i].isEqual(otherInstance)) return <T>all[i];
    }
    this._add(otherInstance);
    return <T>otherInstance;
  }
}

export default Storage;
