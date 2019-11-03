import IndexedDB from './storages/indexeddb';
import WebSQL from './storages/websql';
import LocalStorage from './storages/localstorage';
import Cookies from './storages/cookies';
import JsonStorage from './storages/jsonstorage';
import { StorageOptions } from './storages/types';

const storages: { [x: string]: any } = {
  [IndexedDB.type]: IndexedDB,
  [WebSQL.type]: WebSQL,
  [LocalStorage.type]: LocalStorage,
  [Cookies.type]: Cookies,
  [JsonStorage.type]: JsonStorage
};

type MainOptions = StorageOptions & {
  priority?: string[];
};

class SifrrStorage {
  static availableStores = storages;
  options: MainOptions;

  constructor(options: string | MainOptions) {
    if (typeof options === 'string') this.options = { priority: [options] };
    else {
      this.options = options || {};
      this.options.priority = this.options.priority || [];
    }

    return this.storage;
  }

  get storage() {
    const storage = this.supportedStore();
    if (typeof storage === 'undefined')
      throw Error('No available storage supported in this browser');
    return storage;
  }

  get priority() {
    return this.options.priority.concat([
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
      if (store) {
        const storage = new store(this.options).isSupported();
        return storage;
      }
    }
  }
}

export { IndexedDB, WebSQL, LocalStorage, Cookies, JsonStorage };
export default SifrrStorage;
