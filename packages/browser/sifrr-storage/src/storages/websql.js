const Storage = require('./storage');

class WebSQL extends Storage {
  constructor(options) {
    super(options);
    this.createStore();
  }

  _parsedData() {
    const me = this;
    return new Promise((resolve) => {
      this.store.transaction(function (tx) {
        tx.executeSql(`SELECT * FROM ${me.tableName}`, [], (txn, results) => {
          resolve(me.parse(results));
        });
      });
    });
  }

  _select(keys) {
    const me = this;
    const q = keys.map(() => '?').join(', ');
    // Need to give array for ? values in executeSql's 2nd argument
    return this.execSql(`SELECT key, value FROM ${me.tableName} WHERE key in (${q})`, keys);
  }

  _upsert(data) {
    const table = this.tableName;
    this.store.transaction((tx) => {
      for (let key in data) {
        tx.executeSql(`INSERT OR REPLACE INTO ${table}(key, value) VALUES (?, ?)`, [key, this.constructor.stringify(data[key])]);
      }
    });
  }

  _delete(keys) {
    const table = this.tableName;
    const q = keys.map(() => '?').join(', ');
    return this.execSql(`DELETE FROM ${table} WHERE key in (${q})`, keys);
  }

  _clear() {
    const table = this.tableName;
    return this.execSql(`DELETE FROM ${table}`);
  }

  get store() {
    return window.openDatabase('bs', 1, this._options.description, this._options.size);
  }

  createStore() {
    const table = this.tableName;
    if (!window || typeof window.openDatabase !== 'function') return;
    return this.execSql(`CREATE TABLE IF NOT EXISTS ${table} (key unique, value)`);
  }

  execSql(query, args = []) {
    const me = this;
    return new Promise((resolve) => {
      me.store.transaction(function (tx) {
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

module.exports = WebSQL;
