import IndexedDB from './storages/indexeddb';
import WebSQL from './storages/websql';
import LocalStorage from './storages/localstorage';
import Cookies from './storages/cookies';
import JsonStorage from './storages/jsonstorage';
import { StorageOptions } from './storages/types';
import Storage from './storages/storage';

const storages: { [x: string]: typeof Storage } = {
  [IndexedDB.type]: IndexedDB,
  [WebSQL.type]: WebSQL,
  [LocalStorage.type]: LocalStorage,
  [Cookies.type]: Cookies,
  [JsonStorage.type]: JsonStorage
};

type MainOptions = StorageOptions & {
  priority?: string[];
};

function getSupportedStoreFromPriority(
  priority: string[] = [],
  options: StorageOptions = {}
): Storage {
  priority = priority.concat([
    IndexedDB.type,
    WebSQL.type,
    LocalStorage.type,
    Cookies.type,
    JsonStorage.type
  ]);
  for (let i = 0; i < priority.length; i++) {
    let store = storages[priority[i]];
    if (store) {
      const storage = new store(options);
      if (storage.isSupported()) return storage;
    }
  }
  throw Error(
    'No compatible storage found. Available types: ' + Object.keys(storages).join(', ') + '.'
  );
}

function getStorage(options: string | MainOptions): Storage {
  const priority = typeof options === 'string' ? [options] : (options || {}).priority;
  const stOptions = typeof options === 'string' ? {} : options;

  return getSupportedStoreFromPriority(priority, stOptions);
}

export {
  IndexedDB,
  WebSQL,
  LocalStorage,
  Cookies,
  JsonStorage,
  getStorage,
  storages as availableStores
};
