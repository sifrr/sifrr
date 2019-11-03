import Storage from './storage';
import { StorageOptions } from './types';

declare global {
  interface Window {
    openDatabase: (name: string, version: number, z: any, a: any) => any;
  }
}

class WebSQL extends Storage {
  private _store: any;

  constructor(options: StorageOptions) {
    super(options);
    return (<typeof WebSQL>this.constructor)._matchingInstance(this);
  }

  protected parsedData() {
    return this.execSql(`SELECT key, value FROM ${this.tableName}`);
  }

  protected select(keys: string[]) {
    const q = keys.map(() => '?').join(', ');
    // Need to give array for ? values in executeSql's 2nd argument
    return this.execSql(`SELECT key, value FROM ${this.tableName} WHERE key in (${q})`, keys);
  }

  protected upsert(data: object) {
    return this.getStore()
      .transaction((tx: { executeSql: (arg0: string, arg1: string[]) => void }) => {
        for (let key in data) {
          tx.executeSql(`INSERT OR REPLACE INTO ${this.tableName}(key, value) VALUES (?, ?)`, [
            key,
            (<typeof WebSQL>this.constructor).stringify(data[key])
          ]);
        }
      })
      .then(() => true);
  }

  protected delete(keys: string[]) {
    const q = keys.map(() => '?').join(', ');
    return this.execSql(`DELETE FROM ${this.tableName} WHERE key in (${q})`, keys).then(() => true);
  }

  protected deleteAll() {
    return this.execSql(`DELETE FROM ${this.tableName}`).then(() => true);
  }

  private getStore() {
    if (this._store) return this._store;
    this._store = window.openDatabase('ss', 1, this.description, this.size);
    this.execSql(`CREATE TABLE IF NOT EXISTS ${this.tableName} (key unique, value)`);
    return this._store;
  }

  private execSql(query: string, args = []) {
    const me = this;
    return new Promise(resolve => {
      me.getStore().transaction(function(tx: {
        executeSql: (arg0: any, arg1: any[], arg2: (txn: any, results: any) => void) => void;
      }) {
        tx.executeSql(query, args, (txn: any, results: any) => {
          resolve(me.parse(results));
        });
      });
    });
  }

  private parse(results: {
    rows: {
      length: any;
      item: { (arg0: number): { key: string | number; value: string } };
    };
  }) {
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
