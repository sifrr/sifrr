import Storage from './storage';
import { SavedDataObject, StorageOptions } from './types';

class IndexedDB extends Storage {
  private store?: Promise<IDBDatabase>;

  constructor(options: StorageOptions) {
    super(options);
    return (<typeof IndexedDB>this.constructor)._matchingInstance<IndexedDB>(this);
  }

  protected select(keys: string[]) {
    const ans: SavedDataObject = {};
    const promises: Promise<void>[] = [];
    keys.forEach((key: string | number) =>
      promises.push(this._tx('readonly', 'get', key, undefined).then((r: any) => (ans[key] = r)))
    );
    return Promise.all(promises).then(() => ans);
  }

  protected upsert(data: Record<string, unknown>) {
    const promises = [];
    for (let key in data) promises.push(this._tx('readwrite', 'put', data[key], key));
    return Promise.all(promises).then(() => true);
  }

  protected delete(keys: string[]) {
    const promises: Promise<unknown>[] = [];
    keys.forEach((key: any) => promises.push(this._tx('readwrite', 'delete', key)));
    return Promise.all(promises).then(() => true);
  }

  protected async deleteAll() {
    await this._tx('readwrite', 'clear', undefined);
    return true;
  }

  private _tx(
    scope: IDBTransactionMode,
    fn: 'put' | 'delete' | 'getAllKeys' | 'get' | 'clear',
    param1: any,
    param2?: string
  ) {
    const me = this;
    this.store = this.store ?? this.createStore(me.tableName);
    return this.store.then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(me.tableName, scope).objectStore(me.tableName);
        const request = fn === 'put' ? tx.put(param1, param2) : tx[fn](param1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject((event.target as any)?.error);
      });
    });
  }

  protected getStore() {
    return this._tx('readonly', 'getAllKeys', undefined).then((keys) =>
      this.select(keys as string[])
    );
  }

  private createStore(table: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(table, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(table);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  protected hasStore() {
    return !!window.indexedDB;
  }

  static get type() {
    return 'indexeddb';
  }
}

export default IndexedDB;
