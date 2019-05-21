const Storage = require('./storage');

class IndexedDB extends Storage {
  constructor(options) {
    super(options);
  }

  _parsedData() {
    return this._tx('readonly', 'getAllKeys').then(this._select.bind(this));
  }

  _select(keys) {
    const ans = {};
    const promises = [];
    keys.forEach((key) => promises.push(this._tx('readonly', 'get', key).then((r) => ans[key] = r)));
    return Promise.all(promises).then(() => ans);
  }

  _upsert(data) {
    const promises = [];
    for (let key in data) promises.push(this._tx('readwrite', 'put', data[key], key));
    return Promise.all(promises);
  }

  _delete(keys) {
    const promises = [];
    keys.forEach((key) => promises.push(this._tx('readwrite', 'delete', key)));
    return Promise.all(promises);
  }

  _clear() {
    return this._tx('readwrite', 'clear');
  }

  _tx(scope, fn, param1, param2) {
    const me = this;
    this._store = this._store || this.createStore(me.tableName);
    return this._store.then((db) => {
      return new Promise((resolve, reject) => {
        const tx = db.transaction(me.tableName, scope).objectStore(me.tableName);
        const request = tx[fn].call(tx, param1, param2);
        request.onsuccess = (event) =>  resolve(event.target.result);
        request.onerror = (event) => reject(event.error);
      });
    });
  }

  get store() {
    return window.indexedDB;
  }

  createStore(table) {
    return new Promise((resolve, reject) => {
      const request = this.store.open(table, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(table);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static get type() {
    return 'indexeddb';
  }
}

module.exports = IndexedDB;
