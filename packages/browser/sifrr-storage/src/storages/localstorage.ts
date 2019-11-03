import Storage from './storage';
import { StorageOptions } from './types';

class LocalStorage extends Storage {
  constructor(options: StorageOptions) {
    super(options);
    return (<typeof LocalStorage>this.constructor)._matchingInstance(this);
  }

  protected parsedData() {
    return this.select(
      Object.keys(this.getStore())
        .map(k => {
          if (k.indexOf(this.tableName) === 0) return k.slice(this.tableName.length + 1);
        })
        .filter(k => typeof k !== 'undefined')
    );
  }

  protected select(keys: string[]) {
    const table = {};
    keys.forEach((k: string) => {
      const v = (<typeof LocalStorage>this.constructor).parse(
        this.getStore().getItem(this.tableName + '/' + k)
      );
      if (v !== null) table[k] = v;
    });
    return table;
  }

  protected upsert(data: { [x: string]: any }) {
    for (const key in data) {
      this.getStore().setItem(
        this.tableName + '/' + key,
        (<typeof LocalStorage>this.constructor).stringify(data[key])
      );
    }
    return true;
  }

  protected delete(keys: string[]) {
    keys.map((k: string) => this.getStore().removeItem(this.tableName + '/' + k));
    return true;
  }

  deleteAll() {
    Object.keys(this.getStore()).forEach(k => {
      if (k.indexOf(this.tableName) === 0) this.getStore().removeItem(k);
    });
    return true;
  }

  private getStore() {
    return window.localStorage;
  }

  hasStore() {
    return !!window.localStorage;
  }

  static get type() {
    return 'localstorage';
  }
}

export default LocalStorage;
