import IndexedDB from './storages/indexeddb';
import WebSQL from './storages/websql';
import LocalStorage from './storages/localstorage';
import Cookies from './storages/cookies';
import JsonStorage from './storages/jsonstorage';

let storages = {};
storages[IndexedDB.type] = IndexedDB;
storages[WebSQL.type] = WebSQL;
storages[LocalStorage.type] = LocalStorage;
storages[Cookies.type] = Cookies;
storages[JsonStorage.type] = JsonStorage;

class SifrrStorage {
  constructor(options) {
    if (typeof options === 'string') options = { priority: [options] };
    else options = options || {};
    options.priority = options.priority || [];

    this._options = options;
    return this.storage;
  }

  get storage() {
    const storage = this.supportedStore();
    if (typeof storage === 'undefined')
      throw Error('No available storage supported in this browser');
    return new storage(this._options);
  }

  get priority() {
    return this._options.priority.concat([
      'indexeddb',
      'websql',
      'localstorage',
      'cookies',
      'jsonstorage'
    ]);
  }

  supportedStore() {
    for (let i = 0; i < this.priority.length; i++) {
      let store = storages[this.priority[i]];
      if (store && new store(this._options).isSupported()) return store;
    }
  }
}

SifrrStorage.availableStores = storages;

export { IndexedDB, WebSQL, LocalStorage, Cookies, JsonStorage };
export default SifrrStorage;
