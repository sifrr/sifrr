import Storage from './storage';
import { StorageOptions } from './types';

class JsonStorage extends Storage {
  constructor(options: StorageOptions) {
    super(options);
    return (<typeof JsonStorage>this.constructor)._matchingInstance(this);
  }

  hasStore() {
    return true;
  }

  static get type() {
    return 'jsonstorage';
  }
}

export default JsonStorage;
