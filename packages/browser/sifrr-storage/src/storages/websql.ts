import Storage from './storage';
import { StorageOptions, SavedData, SavedDataObject } from './types';

type websqlResult = {
  rows: {
    length: any;
    item: { (arg0: number): { key: string; value: string } };
  };
};

type websqlStore = {
  transaction(
    a: (tx: {
      executeSql: (arg0: any, arg1: any[], arg2: (tx: any, results: websqlResult) => void) => void;
    }) => void
  ): void;
};

declare global {
  interface Window {
    openDatabase: (name: string, version: number, z: any, a: any) => websqlStore;
  }
}

class WebSQL extends Storage {
  private _store: websqlStore;

  constructor(options: StorageOptions) {
    super(options);
    return (<typeof WebSQL>this.constructor)._matchingInstance(this);
  }

  protected parsedData() {}

  protected select(keys: string[]) {
    const q = keys.map(() => '?').join(', ');
    // Need to give array for ? values in executeSql's 2nd argument
    return this.execSql(`SELECT key, value FROM ${this.tableName} WHERE key in (${q})`, keys);
  }

  protected upsert(data: object) {
    this.getWebsql().transaction((tx: { executeSql: (arg0: string, arg1: string[]) => void }) => {
      for (let key in data) {
        tx.executeSql(`INSERT OR REPLACE INTO ${this.tableName}(key, value) VALUES (?, ?)`, [
          key,
          (<typeof WebSQL>this.constructor).stringify(data[key])
        ]);
      }
    });
    return true;
  }

  protected delete(keys: string[]) {
    const q = keys.map(() => '?').join(', ');
    this.execSql(`DELETE FROM ${this.tableName} WHERE key in (${q})`, keys);
    return true;
  }

  protected deleteAll() {
    this.execSql(`DELETE FROM ${this.tableName}`);
    return true;
  }

  protected getStore() {
    return this.execSql(`SELECT key, value FROM ${this.tableName}`);
  }

  protected hasStore() {
    return !!window.openDatabase;
  }

  private getWebsql() {
    if (this._store) return this._store;
    this._store = window.openDatabase('ss', 1, this.description, this.size);
    this.execSql(`CREATE TABLE IF NOT EXISTS ${this.tableName} (key unique, value)`);
    return this._store;
  }

  private execSql(query: string, args = []): Promise<SavedDataObject> {
    const me = this;
    return new Promise(resolve => {
      me.getWebsql().transaction(function(tx) {
        tx.executeSql(query, args, (tx, results) => {
          resolve(me.parseResults(results));
        });
      });
    });
  }

  private parseResults(results: websqlResult): SavedDataObject {
    const ans = {};
    const len = results.rows.length;
    for (let i = 0; i < len; i++) {
      ans[results.rows.item(i).key] = (<typeof WebSQL>this.constructor).parse(
        results.rows.item(i).value
      );
    }
    return ans;
  }

  static get type() {
    return 'websql';
  }
}

export default WebSQL;
