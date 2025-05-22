import { SavedDataObject, SifrrStore } from './types';
import { stringify, parse } from '../utils/json';

class LocalStorageStore implements SifrrStore {
  public static readonly isSupported: boolean =
    typeof window !== 'undefined' && !!window.localStorage;
  prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  get(key: string) {
    const ret = window.localStorage.getItem(key);
    if (ret === null) return undefined;
    return parse(ret);
  }
  set(key: string, value: any) {
    window.localStorage.setItem(key, stringify(value));
    return this;
  }
  delete(key: string) {
    window.localStorage.removeItem(key);
    return true;
  }
  clear() {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => window.localStorage.removeItem(k));
  }
  has(key: string) {
    return this.get(key) !== undefined;
  }
  all() {
    const data: SavedDataObject = {};
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(this.prefix))
      .forEach((k) => {
        const val = this.get(k);
        if (typeof val === 'undefined') return;
        data[k] = val;
      });
    return data;
  }
}

export default LocalStorageStore;
