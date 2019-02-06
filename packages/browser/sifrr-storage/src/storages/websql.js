const Storage = require('./storage');

class WebSQL extends Storage {
  constructor(options) {
    super(options);
    this.createStore();
  }

  _parsedData() {
    let me = this;
    return new Promise((resolve) => {
      this.store.transaction(function (tx) {
        tx.executeSql(`SELECT * FROM ${me.tableName}`, [], (txn, results) => {
          resolve(me.parse(results));
        });
      });
    });
  }

  _select(keys) {
    let me = this;
    let q = keys.map(() => '?').join(', ');
    // Need to give array for ? values in executeSql's 2nd argument
    return this.execSql(`SELECT key, value FROM ${me.tableName} WHERE key in (${q})`, keys);
  }

  _upsert(data) {
    let table = this.tableName;
    this.store.transaction((tx) => {
      for (let key in data) {
        tx.executeSql(`INSERT OR IGNORE INTO ${table}(key, value) VALUES (?, ?)`, [key, data[key]]);
        tx.executeSql(`UPDATE ${table} SET value = ? WHERE key = ?`, [this.constructor.stringify(data[key]), key]);
      }
    });
  }

  _delete(keys) {
    let table = this.tableName;
    let q = keys.map(() => '?').join(', ');
    return this.execSql(`DELETE FROM ${table} WHERE key in (${q})`, keys);
  }

  _clear() {
    let table = this.tableName;
    return this.execSql(`DELETE FROM ${table}`);
  }

  get store() {
    return window.openDatabase('bs', 1, this._options.description, this._options.size);
  }

  createStore() {
    let table = this.tableName;
    if (!window || typeof window.openDatabase !== 'function') return;
    return this.execSql(`CREATE TABLE IF NOT EXISTS ${table} (key unique, value)`);
  }

  execSql(query, args = []) {
    let me = this;
    return new Promise((resolve) => {
      me.store.transaction(function (tx) {
        tx.executeSql(query, args, (txn, results) => {
          resolve(me.parse(results));
        });
      });
    });
  }

  parse(results) {
    let ans = {};
    let len = results.rows.length, i;
    for (i = 0; i < len; i++) {
      ans[results.rows.item(i).key] = this.constructor.parse(results.rows.item(i).value);
    }
    return ans;
  }

  static get type() {
    return 'websql';
  }
}

module.exports = WebSQL;
