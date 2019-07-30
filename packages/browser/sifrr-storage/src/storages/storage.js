import { stringify, parse } from '../utils/json';

const jsonConstructor = {}.constructor;
const defaultOptions = {
  priority: [],
  name: 'SifrrStorage',
  version: 1,
  description: 'Sifrr Storage',
  size: 5 * 1024 * 1024
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

  _isEqual(other) {
    if (this.tableName == other.tableName && this.type == other.type) {
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
