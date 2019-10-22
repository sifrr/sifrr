import { stringify, parse } from '../utils/json';

const defaultOptions = {
  priority: [],
  name: 'SifrrStorage',
  version: 1,
  description: 'Sifrr Storage',
  size: 5 * 1024 * 1024,
  ttl: 0
};

class Storage {
  constructor(options = {}) {
    this.type = this.constructor.type;
    this._options = Object.assign({}, defaultOptions, options);
    this.name = this._options.name;
    this.version = this._options.version;
    this.tableName = this.name + this.version;
    this.description = this._options.description;
  }

  // overwrited methods
  _select(keys) {
    return Promise.resolve(this._parsedData()).then(data => {
      const ans = {};
      keys.forEach(key => (ans[key] = data[key]));
      return ans;
    });
  }

  _upsert(data) {
    const table = this.table;
    for (let key in data) {
      table[key] = data[key];
    }
    this.table = table;
  }

  _delete(keys) {
    const table = this.table;
    keys.forEach(key => delete table[key]);
    this.table = table;
  }

  _clear() {
    this.table = {};
  }

  _isEqual(other) {
    if (this.tableName == other.tableName && this.type == other.type) {
      return true;
    } else {
      return false;
    }
  }

  // data manipulation methods
  _parseGetData(original) {
    const now = Date.now();
    Object.keys(original).forEach(k => {
      if (typeof original[k] === 'undefined') return;

      const { createdAt, ttl } = original[k];
      original[k] = original[k] && original[k].value;

      if (ttl === 0) return;

      if (now - createdAt > ttl) {
        delete original[k];
        this.del(k);
      }
    });
    return original;
  }

  _parseSetData(key, value) {
    if (typeof value !== 'undefined') {
      return { [key]: this._parseSetValue(value) };
    } else {
      const data = {};
      Object.keys(key).forEach(k => (data[k] = this._parseSetValue(key[k])));
      return data;
    }
  }

  _parseSetValue(value) {
    if (value && value.value) {
      value.ttl = value.ttl || this._options.ttl;
      value.createdAt = Date.now();
      return value;
    } else {
      return {
        value,
        ttl: this._options.ttl,
        createdAt: Date.now()
      };
    }
  }

  _parseKey(key) {
    if (Array.isArray(key)) {
      return key;
    } else if (typeof key === 'string') {
      return [key];
    }
    throw Error('Invalid Key: ' + key);
  }

  // public methods
  keys() {
    return Promise.resolve(this._parsedData()).then(d => Object.keys(d));
  }

  all() {
    return Promise.resolve(this._parsedData()).then(this._parseGetData.bind(this));
  }

  get(key) {
    return Promise.resolve(this._select(this._parseKey(key))).then(this._parseGetData.bind(this));
  }

  set(key, value) {
    return Promise.resolve(this._upsert(this._parseSetData(key, value)));
  }

  del(key) {
    return Promise.resolve(this._delete(this._parseKey(key)));
  }

  clear() {
    return Promise.resolve(this._clear());
  }

  memoize(func, keyFunc = arg => (typeof arg === 'string' ? arg : stringify(arg))) {
    if (typeof func !== 'function') throw Error('Only functions can be memoized');

    return (...args) => {
      const key = keyFunc(...args);
      return this.get(key).then(data => {
        if (data[key] === undefined || data[key] === null) {
          const resultPromise = func(...args);
          if (!(resultPromise instanceof Promise))
            throw Error('Only promise returning functions can be memoized');
          return resultPromise.then(v => {
            return this.set(key, v).then(() => v);
          });
        } else {
          return data[key];
        }
      });
    };
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

  static stringify(data) {
    return stringify(data);
  }

  static parse(data) {
    return parse(data);
  }

  static _add(instance) {
    this._all = this._all || [];
    this._all.push(instance);
  }

  static _matchingInstance(otherInstance) {
    const all = this._all || [],
      length = all.length;
    for (let i = 0; i < length; i++) {
      if (all[i]._isEqual(otherInstance)) return all[i];
    }
    this._add(otherInstance);
    return otherInstance;
  }
}

export default Storage;
