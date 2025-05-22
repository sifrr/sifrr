import { parse } from '@/utils/json';
import { SavedData, SavedDataObject, SifrrStore } from './types';

class IndexedDBStore implements SifrrStore {
  public static readonly isSupported: boolean =
    typeof window !== 'undefined' && !!window.localStorage;
  prefix: string;
  private _store?: Promise<IDBDatabase>;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  get store(): Promise<IDBDatabase> {
    this._store =
      this._store ||
      new Promise((resolve, reject) => {
        const request = window.indexedDB.open(this.prefix, 1);
        request.onupgradeneeded = () => {
          request.result.createObjectStore(this.prefix);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          this._store = undefined;
          reject(request.error);
        };
      });
    return this._store;
  }

  private txn(
    scope: IDBTransactionMode,
    fn: 'put' | 'delete' | 'getAllKeys' | 'get' | 'clear',
    param1: any,
    param2?: string
  ) {
    return this.store.then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.prefix, scope).objectStore(this.prefix);
        const request = fn === 'put' ? tx.put(param1, param2) : tx[fn](param1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(request.error);
      });
    });
  }

  get(key: string) {
    return this.txn('readonly', 'get', key)
      .then((ret) => parse(ret as string) as SavedData)
      .catch(() => undefined);
  }
  set(key: string, value: any) {
    return this.txn('readwrite', 'put', value, key)
      .then(() => this)
      .catch(() => this);
  }
  delete(key: string) {
    return this.txn('readwrite', 'delete', key)
      .then(() => true)
      .catch(() => false);
  }
  async clear() {
    return this.txn('readwrite', 'clear', undefined)
      .then(() => {})
      .catch(() => {});
  }
  has(key: string) {
    return this.get(key) !== undefined;
  }
  all() {
    const data: SavedDataObject = {};
    const promises: Promise<unknown>[] = [];
    this.txn('readonly', 'getAllKeys', undefined).then((keys) => {
      (keys as string[]).forEach((key: string) => {
        promises.push(
          this.get(key).then((r) => {
            if (r !== undefined) {
              data[key] = r;
            }
          })
        );
      });
    });
    return Promise.all(promises).then(() => data);
  }
}

export default IndexedDBStore;
