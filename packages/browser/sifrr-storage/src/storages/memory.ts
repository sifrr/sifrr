import { SavedData, SavedDataObject, SifrrStore } from './types';

const caches = new Map<string, MemoryStore>();

class MemoryStore extends Map<string, SavedData> implements SifrrStore {
  public static readonly isSupported: boolean = true;
  prefix: string;

  constructor(prefix: string) {
    super();
    this.prefix = prefix;
    if (caches.has(prefix)) {
      return caches.get(prefix) as MemoryStore;
    } else {
      caches.set(prefix, this);
    }
  }

  clear() {
    this.forEach((_, key) => {
      if (key.startsWith(this.prefix)) this.delete(key);
    });
  }

  all() {
    const data: SavedDataObject = {};
    this.forEach((value, key) => {
      if (key.startsWith(this.prefix)) data[key] = value;
    });
    return data;
  }
}

export default MemoryStore;
