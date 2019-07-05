/*! Sifrr.Storage v0.0.5 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
this.Sifrr = this.Sifrr || {};
this.Sifrr.Storage = (function () {
  'use strict';

  const toS = Object.prototype.toString;
  const uId = '~SS%l3g5k3~';

  function decodeBlob(str, type) {
    return new Blob([new window.Uint8Array(str.split(',')).buffer], {
      type
    });
  }

  function encodeBlob(blob) {
    const uri = URL.createObjectURL(blob),
          xhr = new XMLHttpRequest();
    xhr.open('GET', uri, false);
    xhr.send();
    URL.revokeObjectURL(uri);
    const ui8 = new Uint8Array(xhr.response.length);

    for (let i = 0; i < xhr.response.length; ++i) {
      ui8[i] = xhr.response.charCodeAt(i);
    }

    return ui8.toString();
  }

  class Json {
    static parse(data) {
      let ans = data;

      if (typeof data === 'string') {
        try {
          ans = data = JSON.parse(data);
        } catch (e) {}
      }

      if (typeof data === 'string' && data.indexOf(uId) > 0) {
        const [type, av, av2] = data.split(uId);
        if (type === 'ArrayBuffer') ans = new window.Uint8Array(av.split(',')).buffer;else if (type === 'Blob') ans = decodeBlob(av2, av);else ans = new window[type](av.split(','));
      } else if (Array.isArray(data)) {
        ans = [];
        data.forEach((v, i) => {
          ans[i] = this.parse(v);
        });
      } else if (typeof data === 'object') {
        if (data === null) return null;
        ans = {};

        for (const k in data) {
          ans[k] = this.parse(data[k]);
        }
      }

      return ans;
    }

    static stringify(data) {
      if (typeof data !== 'object') return JSON.stringify(data);
      if (data === null) return 'null';
      if (Array.isArray(data)) return JSON.stringify(data.map(d => this.stringify(d)));
      const type = toS.call(data).slice(8, -1);

      if (type === 'Object') {
        let ans = {};

        for (let k in data) {
          ans[k] = this.stringify(data[k]);
        }

        return JSON.stringify(ans);
      } else if (type === 'ArrayBuffer') {
        data = new window.Uint8Array(data);
      } else if (type === 'Blob') {
        data = data.type + uId + encodeBlob(data);
      }

      return type + uId + data.toString();
    }

  }

  var json = Json;

  const jsonConstructor = {}.constructor;

  class Storage {
    constructor(options = {}) {
      this._options = options;
      this.name = this._options.name;
      this.version = this._options.version;
      this.tableName = this.name + this.version;
      this.description = this._options.description;
      this.type = this.constructor.type;
    }

    _parseKeyValue(key, value) {
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
      return this.all().then(data => {
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

    isSupported(force = true) {
      if (force && (typeof window === 'undefined' || typeof document === 'undefined')) {
        return true;
      } else if (window && typeof this.store !== 'undefined') {
        return true;
      } else {
        return false;
      }
    }

    keys() {
      return this.all().then(d => Object.keys(d));
    }

    all() {
      return Promise.resolve(this._parsedData());
    }

    get(key) {
      return Promise.resolve(this._select(this._parseKeyValue(key)));
    }

    set(key, value) {
      return Promise.resolve(this._upsert(this._parseKeyValue(key, value)));
    }

    del(key) {
      return Promise.resolve(this._delete(this._parseKeyValue(key)));
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
      return this._tx('readonly', 'getAllKeys').then(this._select.bind(this));
    }

    _select(keys) {
      const ans = {};
      const promises = [];
      keys.forEach(key => promises.push(this._tx('readonly', 'get', key).then(r => ans[key] = r)));
      return Promise.all(promises).then(() => ans);
    }

    _upsert(data) {
      const promises = [];

      for (let key in data) promises.push(this._tx('readwrite', 'put', data[key], key));

      return Promise.all(promises);
    }

    _delete(keys) {
      const promises = [];
      keys.forEach(key => promises.push(this._tx('readwrite', 'delete', key)));
      return Promise.all(promises);
    }

    _clear() {
      return this._tx('readwrite', 'clear');
    }

    _tx(scope, fn, param1, param2) {
      const me = this;
      this._store = this._store || this.createStore(me.tableName);
      return this._store.then(db => {
        return new Promise((resolve, reject) => {
          const tx = db.transaction(me.tableName, scope).objectStore(me.tableName);
          const request = tx[fn].call(tx, param1, param2);

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
          const db = event.target.result;
          db.createObjectStore(table);
        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);
      });
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
      return this.execSql("SELECT key, value FROM ".concat(this.tableName));
    }

    _select(keys) {
      const q = keys.map(() => '?').join(', ');
      return this.execSql("SELECT key, value FROM ".concat(this.tableName, " WHERE key in (").concat(q, ")"), keys);
    }

    _upsert(data) {
      this.store.transaction(tx => {
        for (let key in data) {
          tx.executeSql("INSERT OR REPLACE INTO ".concat(this.tableName, "(key, value) VALUES (?, ?)"), [key, this.constructor.stringify(data[key])]);
        }
      });
    }

    _delete(keys) {
      const q = keys.map(() => '?').join(', ');
      return this.execSql("DELETE FROM ".concat(this.tableName, " WHERE key in (").concat(q, ")"), keys);
    }

    _clear() {
      return this.execSql("DELETE FROM ".concat(this.tableName));
    }

    get store() {
      return window.openDatabase('ss', 1, this._options.description, this._options.size);
    }

    createStore() {
      if (!window || typeof window.openDatabase !== 'function') return;
      return this.execSql("CREATE TABLE IF NOT EXISTS ".concat(this.tableName, " (key unique, value)"));
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
      return this._select(Object.keys(this.store).map(k => {
        if (k.indexOf(this.tableName) === 0) return k.slice(this.tableName.length + 1);
      }).filter(k => typeof k !== 'undefined'));
    }

    _select(keys) {
      const table = {};
      keys.forEach(k => {
        const v = this.constructor.parse(this.store.getItem(this.tableName + '/' + k));
        if (v !== null) table[k] = v;
      });
      return table;
    }

    _upsert(data) {
      for (let key in data) {
        this.store.setItem(this.tableName + '/' + key, this.constructor.stringify(data[key]));
      }

      return true;
    }

    _delete(keys) {
      return keys.map(k => this.store.removeItem(this.tableName + '/' + k));
    }

    _clear() {
      Object.keys(this.store).forEach(k => {
        if (k.indexOf(this.tableName) === 0) this.store.removeItem(k);
      });
      return true;
    }

    get store() {
      return window.localStorage;
    }

    static get type() {
      return 'localstorage';
    }

  }

  var localstorage = LocalStorage;

  const date = new Date(0).toUTCString();
  const equal = '%3D',
        equalRegex = new RegExp(equal, 'g');

  class Cookies extends storage {
    constructor(options) {
      super(options);
    }

    _parsedData() {
      let result = this.store,
          ans = {};
      result.split('; ').forEach(value => {
        let [k, v] = value.split('=');
        if (k.indexOf(this.tableName) === 0) ans[k.slice(this.tableName.length + 1)] = this.constructor.parse(v.replace(equalRegex, '='));
      });
      return ans;
    }

    _upsert(data) {
      for (let key in data) {
        this.store = "".concat(this.tableName, "/").concat(key, "=").concat(this.constructor.stringify(data[key]).replace(/=/g, equal), "; path=/");
      }

      return true;
    }

    _clear() {
      let result = this.store;
      result.split('; ').forEach(value => {
        const k = value.split('=')[0];

        if (k.indexOf(this.tableName) === 0) {
          this.store = "".concat(k, "=; expires=").concat(date, "; path=/");
        }
      });
    }

    get store() {
      return document.cookie;
    }

    set store(v) {
      document.cookie = v;
    }

    static get type() {
      return 'cookies';
    }

  }

  var cookies = Cookies;

  class JsonStorage extends storage {
    constructor(options, data = {}) {
      super(options);
      this.table = storage.parse(data);
    }

    _parsedData() {
      return this.table;
    }

    get store() {
      return this.table;
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
      this.all.push(instance);
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

    static json(data) {
      return new jsonstorage({}, data);
    }

  }

  SifrrStorage.availableStores = storages_1;
  SifrrStorage.all = [];
  var sifrr_storage = SifrrStorage;

  return sifrr_storage;

}());
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.storage.js.map
