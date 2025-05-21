import Storage from './storage';
import { StorageOptions } from './types';

class MemoryStorage extends Storage {
  constructor(options: StorageOptions) {
    super(options);
    return (<typeof MemoryStorage>this.constructor)._matchingInstance(this);
  }

  protected hasStore() {
    return true;
  }

  static get type() {
    return 'memory';
  }
}

export default MemoryStorage;
