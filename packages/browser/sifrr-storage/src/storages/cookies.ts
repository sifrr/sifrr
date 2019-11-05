import Storage from './storage';
import { StorageOptions } from './types';

const date = new Date(0).toUTCString();
const equal = '%3D',
  equalRegex = new RegExp(equal, 'g');

class Cookies extends Storage {
  constructor(options: StorageOptions) {
    super(options);
    return (<typeof Cookies>this.constructor)._matchingInstance<Cookies>(this);
  }

  protected upsert(data: object) {
    for (let key in data) {
      this.setStore(
        `${this.tableName}/${key}=${(<typeof Storage>this.constructor)
          .stringify(data[key])
          .replace(/=/g, equal)}; path=/`
      );
    }
    return true;
  }

  protected delete(keys: string[]) {
    keys.forEach((k: any) => this.setStore(`${this.tableName}/${k}=; expires=${date}; path=/`));
    return true;
  }

  protected deleteAll() {
    return this.keys().then(this.delete.bind(this));
  }

  protected getStore() {
    let result = document.cookie,
      ans = {};
    result.split('; ').forEach(value => {
      let [k, v] = value.split('=');
      if (k.indexOf(this.tableName) === 0)
        ans[k.slice(this.tableName.length + 1)] = (<typeof Storage>this.constructor).parse(
          v.replace(equalRegex, '=')
        );
    });
    return ans;
  }

  protected setStore(v: string) {
    document.cookie = v;
  }

  hasStore() {
    return !!document.cookie;
  }

  static get type() {
    return 'cookies';
  }
}

export default Cookies;
