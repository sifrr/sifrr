const Storage = require('./storage');

class Cookies extends Storage {
  constructor(options) {
    super(options);
  }

  _parsedData() {
    return this.table;
  }

  get table() {
    let result = this.store, ans = {};
    result.split('; ').forEach((value) => {
      let [k, v] = value.split('=');
      ans[k] = this.constructor.parse(v);
    });
    return ans[this.tableName] || {};
  }

  set table(value) {
    document.cookie = `${this.tableName}=${Storage.stringify(value)}; path=/`;
  }

  get store() {
    return document.cookie;
  }

  static get type() {
    return 'cookies';
  }
}

module.exports = Cookies;
