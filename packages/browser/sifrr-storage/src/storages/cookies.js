import Storage from './storage';
const date = new Date(0).toUTCString();
const equal = '%3D',
  equalRegex = new RegExp(equal, 'g');

class Cookies extends Storage {
  constructor(options) {
    super(options);
    return this.constructor._matchingInstance(this);
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

  _delete(keys) {
    keys.forEach(k => (this.store = `${this.tableName}/${k}=; expires=${date}; path=/`));
    return true;
  }

  _clear() {
    return this.keys().then(this._delete.bind(this));
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

export default Cookies;
