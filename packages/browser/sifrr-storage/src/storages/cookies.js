const Storage = require('./storage');
const date = new Date(0).toUTCString();
const equal = '%3D',
  equalRegex = new RegExp(equal, 'g');

class Cookies extends Storage {
  constructor(options) {
    super(options);
  }

  _parsedData() {
    let result = this.store,
      ans = {};
    result.split('; ').forEach(value => {
      let [k, v] = value.split('=');
      if (k.indexOf(this.tableName) === 0)
        ans[k.slice(this.tableName.length + 1)] = this.constructor.parse(
          v.replace(equalRegex, '=')
        );
    });
    return ans;
  }

  _upsert(data) {
    for (let key in data) {
      this.store = `${this.tableName}/${key}=${this.constructor
        .stringify(data[key])
        .replace(/=/g, equal)}; path=/`;
    }
    return true;
  }

  _clear() {
    let result = this.store;
    result.split('; ').forEach(value => {
      const k = value.split('=')[0];
      if (k.indexOf(this.tableName) === 0) {
        this.store = `${k}=; expires=${date}; path=/`;
      }
    });
  }

  get store() {
    return document.cookie;
  }

  set store(v) {
    document.cookie = v;
  }

  static get type() {
    return 'cookies';
  }
}

module.exports = Cookies;
