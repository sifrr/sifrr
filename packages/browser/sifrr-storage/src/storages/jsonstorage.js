const Storage = require('./storage');

class JsonStorage extends Storage {
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

module.exports = JsonStorage;
