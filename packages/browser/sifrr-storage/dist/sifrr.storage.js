/*! Sifrr.Storage v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, (global.Sifrr = global.Sifrr || {}, global.Sifrr.Storage = factory()));
}(this, function () { 'use strict';

  class Json {
    static parse(data) {
      let ans = {};
      if (typeof data == 'string') {
        try {
          ans = JSON.parse(data);
        } catch (e) {
          return data;
        }
        return this.parse(ans);
      } else if (Array.isArray(data)) {
        ans = [];
        data.forEach((v, i) => {
          ans[i] = this.parse(v);
        });
      } else if (typeof data == 'object') {
        if (data === null) return null;
        for (const k in data) {
          ans[k] = this.parse(data[k]);
        }
      } else {
        return data;
      }
      return ans;
    }
    static stringify(data) {
      if (typeof data == 'string') {
        return data;
      } else {
        return JSON.stringify(data);
      }
    }
  }
  var json = Json;

  class Storage {
    constructor(options = {}) {
      this._options = options;
    }
    _parseKeyValue(key, value) {
      let jsonConstructor = {}.constructor;
      if (typeof value === 'undefined') {
        if (Array.isArray(key)) {
          return key;
        } else if (typeof key === 'string') {
          return [key];
        } else if (key.constructor === jsonConstructor) {
          return key;
        }
        {
          throw Error('Invalid Key');
        }
      } else if (typeof key === 'string') {
        let ans = {};
        ans[key] = value;
        return ans;
      } else {
        throw Error('Invalid Key');
      }
    }
    _select(keys) {
      return this.data().then(data => {
        let ans = {};
        keys.forEach(key => ans[key] = data[key]);
        return ans;
      });
    }
    _upsert(data) {
      let table = this.table;
      for (let key in data) {
        table[key] = data[key];
      }
      this.table = table;
    }
    _delete(keys) {
      let table = this.table;
      keys.forEach(key => delete table[key]);
      this.table = table;
    }
    _clear() {
      this.table = {};
    }
    _isEqual(options, type) {
      if (this.tableName == options.name + options.version && this.type == type) {
        return true;
      } else {
        return false;
      }
    }
    get tableName() {
      return this.name + this.version;
    }
    get name() {
      return this._options.name;
    }
    get version() {
      return this._options.version;
    }
    get description() {
      return this._options.description;
    }
    get type() {
      return this.constructor.type;
    }
    isSupported(force = true) {
      if (force && (typeof window === 'undefined' || typeof document === 'undefined')) {
        return true;
      } else if (window && typeof this.store !== 'undefined') {
        return true;
      } else {
        return false;
      }
    }
    all() {
      return this.data();
    }
    data() {
      return Promise.resolve(this._parsedData());
    }
    select(key) {
      return Promise.resolve(this._select(this._parseKeyValue(key)));
    }
    insert(key, value) {
      return Promise.resolve(this._upsert(this._parseKeyValue(key, value)));
    }
    update(key, value) {
      return Promise.resolve(this._upsert(this._parseKeyValue(key, value)));
    }
    upsert(key, value) {
      return Promise.resolve(this._upsert(this._parseKeyValue(key, value)));
    }
    delete(key) {
      return Promise.resolve(this._delete(this._parseKeyValue(key)));
    }
    deleteAll() {
      return Promise.resolve(this._clear());
    }
    clear() {
      return Promise.resolve(this._clear());
    }
    static stringify(data) {
      return json.stringify(data);
    }
    static parse(data) {
      return json.parse(data);
    }
  }
  var storage = Storage;

  class IndexedDB extends storage {
    constructor(options) {
      super(options);
    }
    _parsedData() {
      return this._tx('readonly', 'getAll').then(result => this.parse(result));
    }
    _select(keys) {
      let ans = {};
      let promises = [];
      keys.forEach(key => promises.push(this._tx('readonly', 'get', key).then(r => ans[key] = this.parse(r))));
      return Promise.all(promises).then(() => ans);
    }
    _upsert(data) {
      let promises = [];
      for (let key in data) {
        let promise = this._tx('readonly', 'get', key).then(oldResult => {
          if (oldResult && oldResult.key == key) {
            return this._tx('readwrite', 'put', {
              key: key,
              value: data[key]
            });
          } else {
            return this._tx('readwrite', 'add', {
              key: key,
              value: data[key]
            });
          }
        });
        promises.push(promise);
      }
      return Promise.all(promises);
    }
    _delete(keys) {
      let promises = [];
      keys.forEach(key => promises.push(this._tx('readwrite', 'delete', key)));
      return Promise.all(promises);
    }
    _clear() {
      return this._tx('readwrite', 'clear');
    }
    _tx(scope, fn, params) {
      const me = this;
      return this.createStore(me.tableName).then(db => {
        return new Promise((resolve, reject) => {
          let tx = db.transaction(me.tableName, scope).objectStore(me.tableName);
          let request = tx[fn].call(tx, params);
          request.onsuccess = event => resolve(event.target.result);
          request.onerror = event => reject(event.error);
        });
      });
    }
    get store() {
      return window.indexedDB;
    }
    createStore(table) {
      return new Promise((resolve, reject) => {
        const request = this.store.open(table, 1);
        request.onupgradeneeded = event => {
          let db = event.target.result;
          db.createObjectStore(table, {
            keyPath: 'key'
          });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    parse(data) {
      let ans = {};
      if (Array.isArray(data)) {
        data.forEach(row => {
          ans[row.key] = row.value;
        });
      } else if (data && data.value) {
        return data.value;
      } else {
        return undefined;
      }
      return ans;
    }
    static get type() {
      return 'indexeddb';
    }
  }
  var indexeddb = IndexedDB;

  class WebSQL extends storage {
    constructor(options) {
      super(options);
      this.createStore();
    }
    _parsedData() {
      const me = this;
      return new Promise(resolve => {
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
      return this.execSql(`SELECT key, value FROM ${me.tableName} WHERE key in (${q})`, keys);
    }
    _upsert(data) {
      const table = this.tableName;
      this.store.transaction(tx => {
        for (let key in data) {
          tx.executeSql(`INSERT OR IGNORE INTO ${table}(key, value) VALUES (?, ?)`, [key, data[key]]);
          tx.executeSql(`UPDATE ${table} SET value = ? WHERE key = ?`, [this.constructor.stringify(data[key]), key]);
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
      return new Promise(resolve => {
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
  var websql = WebSQL;

  class LocalStorage extends storage {
    constructor(options) {
      super(options);
    }
    _parsedData() {
      return this.table;
    }
    get table() {
      return this.constructor.parse(this.store.getItem(this.tableName) || {});
    }
    set table(value) {
      this.store.setItem(this.tableName, this.constructor.stringify(value));
    }
    get store() {
      return window.localStorage;
    }
    static get type() {
      return 'localstorage';
    }
  }
  var localstorage = LocalStorage;

  class Cookies extends storage {
    constructor(options) {
      super(options);
    }
    _parsedData() {
      return this.table;
    }
    get table() {
      let result = this.store,
          ans = {};
      result.split('; ').forEach(value => {
        let [k, v] = value.split('=');
        ans[k] = this.constructor.parse(v);
      });
      return ans[this.tableName] || {};
    }
    set table(value) {
      document.cookie = `${this.tableName}=${storage.stringify(value)}; path=/`;
    }
    get store() {
      return document.cookie;
    }
    static get type() {
      return 'cookies';
    }
  }
  var cookies = Cookies;

  class JsonStorage extends storage {
    constructor(options, data = {}) {
      super(options);
      this._upsert(this.constructor.parse(data));
    }
    _parsedData() {
      return this._table;
    }
    get store() {
      return this._table;
    }
    get table() {
      return this._table || {};
    }
    set table(value) {
      this._table = value;
    }
    static get type() {
      return 'jsonstorage';
    }
  }
  var jsonstorage = JsonStorage;

  let storages = {};
  storages[indexeddb.type] = indexeddb;
  storages[websql.type] = websql;
  storages[localstorage.type] = localstorage;
  storages[cookies.type] = cookies;
  storages[jsonstorage.type] = jsonstorage;
  var storages_1 = storages;

  class SifrrStorage {
    constructor(options) {
      if (typeof options === 'string') options = {
        priority: [options]
      };else options = options || {};
      this._options = Object.assign(this.constructor.defaultOptions, options);
      return this.storage;
    }
    get storage() {
      let storage = this.supportedStore();
      if (typeof storage === 'undefined') throw Error('No available storage supported in this browser');
      let matchingInstance = this.constructor._matchingInstance(this._options, storage.type);
      if (matchingInstance) {
        return matchingInstance;
      } else {
        let storageInstance = new storage(this._options);
        this.constructor._add(storageInstance);
        return storageInstance;
      }
    }
    get priority() {
      return this._options.priority.concat(['indexeddb', 'websql', 'localstorage', 'cookies', 'jsonstorage']);
    }
    supportedStore() {
      for (let i = 0; i < this.priority.length; i++) {
        let store = this.constructor.availableStores[this.priority[i]];
        if (store && new store(this._options).isSupported()) return store;
      }
    }
    static _matchingInstance(options, type) {
      let allInstances = this.all,
          i;
      let length = allInstances.length;
      for (i = 0; i < length; i++) {
        if (allInstances[i]._isEqual(options, type)) return allInstances[i];
      }
      return false;
    }
    static _add(instance) {
      this._all = this._all || [];
      this._all.push(instance);
    }
    static get availableStores() {
      return storages_1;
    }
    static get defaultOptions() {
      return {
        priority: [],
        name: 'SifrrStorage',
        version: 1,
        description: 'Sifrr Storage',
        size: 5 * 1024 * 1024
      };
    }
    static get all() {
      return this._all || [];
    }
    static json(data) {
      return new jsonstorage({}, data);
    }
  }
  var sifrr_storage = SifrrStorage;

  return sifrr_storage;

}));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.storage.js.map
