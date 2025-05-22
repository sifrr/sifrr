import { SavedData, SavedDataObject, SifrrStore } from './types';

class MemoryStore extends Map<string, SavedData> implements SifrrStore {
  public static readonly isSupported: boolean = true;
  prefix: string;

  constructor(prefix: string) {
    super();
    this.prefix = prefix;
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
