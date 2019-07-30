import Storage from './storage';

class WebSQL extends Storage {
  constructor(options) {
    super(options);
    return this.constructor._matchingInstance(this);
  }

  _parsedData() {
    return this.execSql(`SELECT key, value FROM ${this.tableName}`);
  }

  _select(keys) {
    const q = keys.map(() => '?').join(', ');
    // Need to give array for ? values in executeSql's 2nd argument
    return this.execSql(`SELECT key, value FROM ${this.tableName} WHERE key in (${q})`, keys);
  }

  _upsert(data) {
    this.store.transaction(tx => {
      for (let key in data) {
        tx.executeSql(`INSERT OR REPLACE INTO ${this.tableName}(key, value) VALUES (?, ?)`, [
          key,
          this.constructor.stringify(data[key])
        ]);
      }
    });
  }

  _delete(keys) {
    const q = keys.map(() => '?').join(', ');
    return this.execSql(`DELETE FROM ${this.tableName} WHERE key in (${q})`, keys);
  }

  _clear() {
    return this.execSql(`DELETE FROM ${this.tableName}`);
  }

  get store() {
    if (this._store) return this._store;
    this._store = window.openDatabase('ss', 1, this._options.description, this._options.size);
    this.execSql(`CREATE TABLE IF NOT EXISTS ${this.tableName} (key unique, value)`);
    return this._store;
  }

  execSql(query, args = []) {
    const me = this;
    return new Promise(resolve => {
      me.store.transaction(function(tx) {
        tx.executeSql(query, args, (txn, results) => {
          resolve(me.parse(results));
        });
      });
    });
  }

  parse(results) {
    const ans = {};
    const len = results.rows.length;
    for (let i = 0; i < len; i++) {
      ans[results.rows.item(i).key] = this.constructor.parse(results.rows.item(i).value);
    }
    return ans;
  }

  static get type() {
    return 'websql';
  }
}

export default WebSQL;
