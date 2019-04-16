const Storage = require('./storage');

class JsonStorage extends Storage {
  constructor(options, data = {}) {
    super(options);
    this.table = Storage.parse(data);
  }

  _parsedData() {
    return this.table;
  }

  _upsert(data) {
    for (let key in data) {
      this.table[key] = data[key];
    }
  }

  get store() {
    return this.table;
  }

  static get type() {
    return 'jsonstorage';
  }
}

module.exports = JsonStorage;
