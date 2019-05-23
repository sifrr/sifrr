const Storage = require('./storage');

class JsonStorage extends Storage {
  constructor(options, data = {}) {
    super(options);
    this.table = Storage.parse(data);
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

module.exports = JsonStorage;
