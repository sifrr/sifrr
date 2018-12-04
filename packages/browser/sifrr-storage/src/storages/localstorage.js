const Storage = require('./storage');

class LocalStorage extends Storage {
  constructor(options) {
    super(options);
  }

  _parsedData() {
    return this.table;
  }

  get table() {
    return this.constructor.parse(this.store.getItem(this.tableName));
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

module.exports = LocalStorage;
