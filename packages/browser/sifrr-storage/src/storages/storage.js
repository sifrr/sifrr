const JsonExt = require('../utils/json');
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
      keys.forEach(key => (ans[key] = data[key]));
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
    return JsonExt.stringify(data);
  }

  static parse(data) {
    return JsonExt.parse(data);
  }
}

module.exports = Storage;
