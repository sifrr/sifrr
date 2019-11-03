import Storage from './storage';
import { StorageOptions } from './types';

class IndexedDB extends Storage {
  private store: any;

  constructor(options: StorageOptions) {
    super(options);
    return (<typeof IndexedDB>this.constructor)._matchingInstance<IndexedDB>(this);
  }

  protected parsedData() {
    return this._tx('readonly', 'getAllKeys', undefined, undefined).then(this.select.bind(this));
  }

  protected select(keys: string[]) {
    const ans = {};
    const promises = [];
    keys.forEach((key: string | number) =>
      promises.push(this._tx('readonly', 'get', key, undefined).then((r: any) => (ans[key] = r)))
    );
    return Promise.all(promises).then(() => ans);
  }

  protected upsert(data: object) {
    const promises = [];
    for (let key in data) promises.push(this._tx('readwrite', 'put', data[key], key));
    return Promise.all(promises).then(() => true);
  }

  protected delete(keys: string[]) {
    const promises = [];
    keys.forEach((key: any) => promises.push(this._tx('readwrite', 'delete', key, undefined)));
    return Promise.all(promises).then(() => true);
  }

  protected deleteAll() {
    return this._tx('readwrite', 'clear', undefined, undefined);
  }

  private _tx(scope: string, fn: string, param1: any, param2: string) {
    const me = this;
    this.store = this.store || this.createStore(me.tableName);
    return this.store.then(
      (db: {
        transaction: (arg0: string, arg1: any) => { objectStore: (arg0: string) => void };
      }) => {
        return new Promise((resolve, reject) => {
          const tx = db.transaction(me.tableName, scope).objectStore(me.tableName);
          const request = tx[fn].call(tx, param1, param2);
          request.onsuccess = (event: { target: { result: unknown } }) =>
            resolve(event.target.result);
          request.onerror = (event: { error: any }) => reject(event.error);
        });
      }
    );
  }

  private getStore() {
    return window.indexedDB;
  }

  private createStore(table: string) {
    return new Promise((resolve, reject) => {
      const request = this.getStore().open(table, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(table);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  hasStore() {
    return !!window.indexedDB;
  }

  static get type() {
    return 'indexeddb';
  }
}

export default IndexedDB;
