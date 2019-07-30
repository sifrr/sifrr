import Storage from './storage';

class JsonStorage extends Storage {
  constructor(options) {
    super(options);
    return this.constructor._matchingInstance(this);
  }

  _parsedData() {
    return this.table;
  }

  get table() {
    return this._table || {};
  }

  set table(v) {
    this._table = v;
  }

  get store() {
    return true;
  }

  static get type() {
    return 'jsonstorage';
  }
}

export default JsonStorage;
