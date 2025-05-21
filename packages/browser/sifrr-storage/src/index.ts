import IndexedDB from './storages/indexeddb';
import LocalStorage from './storages/localstorage';
import Cookies from './storages/cookies';
import MemoryStorage from './storages/memory';
import { StorageOptions } from './storages/types';
import Storage from './storages/storage';

type StorageConstructor = {
  new (options: StorageOptions): Storage;
};

const storages: { [x: string]: StorageConstructor } = {
  [IndexedDB.type]: IndexedDB,
  [LocalStorage.type]: LocalStorage,
  [Cookies.type]: Cookies,
  [MemoryStorage.type]: MemoryStorage
};

type MainOptions = StorageOptions & {
  priority?: string[];
};

function getSupportedStoreFromPriority(
  priority: string[] = [],
  options: StorageOptions = {}
): Storage {
  priority = priority.concat([IndexedDB.type, LocalStorage.type, Cookies.type, MemoryStorage.type]);
  for (const element of priority) {
    let store = storages[element];
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
  LocalStorage,
  Cookies,
  MemoryStorage as JsonStorage,
  getStorage,
  storages as availableStores
};
