const Storage = require('./storage');

class LocalStorage extends Storage {
  constructor(options) {
    super(options);
  }

  _parsedData() {
    return this._select(
      Object.keys(this.store)
        .map(k => {
          if (k.indexOf(this.tableName) === 0) return k.slice(this.tableName.length + 1);
        })
        .filter(k => typeof k !== 'undefined')
    );
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

module.exports = LocalStorage;
